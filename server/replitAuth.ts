import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SUPABASE_URL = "https://okgpcsfqkshdzbfuigfq.supabase.co";

function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function upsertReplitUser(claims: Record<string, unknown>) {
  await pool.query(
    `INSERT INTO replit_users (id, email, first_name, last_name, profile_image_url)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       profile_image_url = EXCLUDED.profile_image_url,
       updated_at = NOW()`,
    [
      claims["sub"],
      claims["email"],
      claims["first_name"],
      claims["last_name"],
      claims["profile_image_url"],
    ]
  );
}

async function provisionSupabaseSession(
  claims: Record<string, unknown>
): Promise<string | null> {
  const email = claims["email"] as string | undefined;
  if (!email) return null;

  const supabaseAdmin = getSupabaseAdmin();
  const displayName = [claims["first_name"], claims["last_name"]]
    .filter(Boolean)
    .join(" ") || undefined;

  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      full_name: displayName,
      avatar_url: claims["profile_image_url"],
      replit_id: claims["sub"],
    },
  });

  if (createError && createError.message !== "A user with this email address has already been registered") {
    console.error("[replitAuth] createUser error:", createError.message);
  }

  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${SUPABASE_URL}` },
    });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("[replitAuth] generateLink error:", linkError?.message);
    return null;
  }

  return linkData.properties.action_link;
}

const getOidcConfig = memoize(
  async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      return await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID!,
        { signal: controller.signal } as any
      );
    } finally {
      clearTimeout(timeoutId);
    }
  },
  { maxAge: 3600 * 1000 }
);

function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: Record<string, unknown>,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = (user.claims as Record<string, unknown>)?.exp;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user: Record<string, unknown> = {};
      updateUserSession(user, tokens);
      const claims = tokens.claims() as Record<string, unknown>;
      await upsertReplitUser(claims);
      const actionLink = await provisionSupabaseSession(claims);
      user.supabase_action_link = actionLink;
      verified(null, user);
    } catch (err) {
      console.error("[replitAuth] verify error:", err instanceof Error ? err.message : err);
      verified(err as Error);
    }
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = async (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const config = await getOidcConfig();
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", async (req, res, next) => {
    try {
      await ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (err) {
      console.error("[/api/login] error:", err instanceof Error ? err.message : err);
      res.status(500).json({ error: "Failed to initiate login" });
    }
  });

  app.get("/api/callback", async (req, res, next) => {
    try {
      await ensureStrategy(req.hostname);
      passport.authenticate(
        `replitauth:${req.hostname}`,
        { failureRedirect: "/auth?error=replit_auth_failed" },
        (err: unknown, user: Record<string, unknown> | false) => {
          if (err || !user) {
            return res.redirect("/auth?error=replit_auth_failed");
          }
          req.logIn(user, (loginErr) => {
            if (loginErr) return res.redirect("/auth?error=replit_auth_failed");
            const actionLink = user.supabase_action_link as string | undefined;
            if (actionLink) {
              const redirectUrl = new URL(actionLink);
              redirectUrl.searchParams.set(
                "redirect_to",
                `${req.protocol}://${req.hostname}/`
              );
              return res.redirect(redirectUrl.toString());
            }
            return res.redirect("/");
          });
        }
      )(req, res, next);
    } catch (err) {
      console.error("[/api/callback] error:", err instanceof Error ? err.message : err);
      res.redirect("/auth?error=replit_auth_failed");
    }
  });

  app.get("/api/logout", async (req, res) => {
    try {
      const config = await getOidcConfig();
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    } catch (err) {
      console.error("[/api/logout] error:", err instanceof Error ? err.message : err);
      res.redirect("/auth");
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (
        req.user as Record<string, unknown> & {
          claims: Record<string, unknown>;
        }
      ).claims.sub as string;
      const { rows } = await pool.query(
        "SELECT * FROM replit_users WHERE id = $1",
        [userId]
      );
      res.json(rows[0] ?? null);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as Record<string, unknown> | undefined;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= (user.expires_at as number)) {
    return next();
  }

  const refreshToken = user.refresh_token as string | undefined;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const oidcConfig = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(oidcConfig, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
