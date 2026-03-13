import { Router, Request, Response, RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET_NAME = "reports";

function getServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

async function ensureBucket(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase.storage.getBucket(BUCKET_NAME);
  if (!data) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    });
  }
}

interface SessionUser {
  claims: { sub: string; email?: string };
  expires_at: number;
}

function getSessionUser(req: Request): SessionUser | null {
  const user = req.user as SessionUser | undefined;
  if (!req.isAuthenticated?.() || !user?.claims?.sub) return null;
  const now = Math.floor(Date.now() / 1000);
  if (user.expires_at && now > user.expires_at) return null;
  return user;
}

async function resolveProfileId(
  supabase: ReturnType<typeof createClient>,
  email: string,
): Promise<string | null> {
  const { data } = await supabase.auth.admin.listUsers();
  const supaUser = data?.users?.find(u => u.email === email);
  return supaUser?.id ?? null;
}

const requireAuth: RequestHandler = (req, res, next) => {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
};

router.post("/api/reports/generate", requireAuth, async (req: Request, res: Response) => {
  try {
    const sessionUser = getSessionUser(req)!;
    const { templateName, fileData, fileFormat, rowCount, templateId } = req.body;

    if (!templateName || !fileData) {
      return res.status(400).json({ error: "Missing required fields: templateName, fileData" });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return res.status(200).json({
        id: null,
        download_url: null,
        message: "Storage not configured; report saved locally only",
      });
    }

    const email = sessionUser.claims.email;
    if (!email) {
      return res.status(400).json({ error: "User email not available in session" });
    }

    const profileId = await resolveProfileId(supabase, email);
    if (!profileId) {
      return res.status(403).json({ error: "No matching Supabase profile found for this user" });
    }

    await ensureBucket(supabase);

    const reportId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = fileFormat === "xlsx" ? "xlsx" : "csv";
    const storagePath = `${profileId}/${timestamp}_${templateName.replace(/\s+/g, "_")}.${ext}`;

    const contentType = ext === "xlsx"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "text/csv";

    const fileBuffer = Buffer.from(fileData, "utf-8");
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, { contentType, upsert: false });

    if (uploadError) {
      console.error("[Reports] Storage upload failed:", uploadError.message);
      return res.status(500).json({ error: `Upload failed: ${uploadError.message}` });
    }

    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 7 * 24 * 60 * 60);

    const downloadUrl = urlData?.signedUrl || null;

    const { error: dbError } = await supabase
      .from("generated_reports")
      .insert({
        id: reportId,
        profile_id: profileId,
        template_id: templateId && !templateId.startsWith("builtin-") ? templateId : null,
        template_name: templateName,
        generated_at: new Date().toISOString(),
        row_count: rowCount || 0,
        file_format: fileFormat || "csv",
        file_data: fileData.length <= 500_000 ? fileData : null,
        download_url: downloadUrl,
      });

    if (dbError) {
      console.error("[Reports] DB insert failed:", dbError.message);
      return res.status(500).json({ error: `Database save failed: ${dbError.message}` });
    }

    return res.json({
      id: reportId,
      download_url: downloadUrl,
      storage_path: storagePath,
    });
  } catch (err) {
    console.error("[Reports] Generate error:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
});

export default router;
