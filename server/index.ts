import express from "express";
import { join } from "path";
import { setupAuth, closeAuth } from "./replitAuth";
import { closePool } from "./db";
import { runServerSync, runSyncForAllConnected, startScheduledSync, stopScheduledSync } from "./techOpsSyncService";
import reportRoutes from "./reportRoutes";
import crmRoutes from "./crmRoutes";
import moduleRoutes from "./moduleRoutes";
const app = express();

app.use(express.json({ limit: "10mb" }));

process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err.message, err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("[WARN] Unhandled rejection:", reason);
});

process.on("SIGHUP", () => {
  console.log("[Signal] SIGHUP received — ignoring");
});

async function main() {
  try {
    await setupAuth(app);
    console.log("[Auth] Setup complete");
  } catch (authError) {
    console.warn("[Auth] Setup failed, continuing without auth:", authError);
  }

  app.use(reportRoutes);
  app.use(crmRoutes);
  app.use(moduleRoutes);

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: Math.floor(process.uptime()),
      memory: Math.floor(process.memoryUsage().rss / 1024 / 1024),
    });
  });

  app.post("/api/techops/sync", async (req, res) => {
    try {
      const user = (req as any).user as Record<string, unknown> & { claims?: Record<string, unknown> } | undefined;
      const profileId = user?.claims?.sub as string;
      if (!profileId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { integrationId, integrationName } = req.body;
      if (!integrationId || !integrationName) {
        return res.status(400).json({ error: "integrationId and integrationName are required" });
      }
      const result = await runServerSync(profileId, integrationId, integrationName);
      res.json(result);
    } catch (err: unknown) {
      console.error("[TechOps] Sync error:", err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Sync failed" });
    }
  });

  app.post("/api/techops/sync-all", async (req, res) => {
    try {
      const user = (req as any).user as Record<string, unknown> & { claims?: Record<string, unknown> } | undefined;
      const profileId = user?.claims?.sub as string;
      if (!profileId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      await runSyncForAllConnected(profileId);
      res.json({ success: true });
    } catch (err: unknown) {
      console.error("[TechOps] Sync all error:", err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Sync failed" });
    }
  });

  startScheduledSync();

  const distPath = join(process.cwd(), "dist");
  app.use(express.static(distPath, { maxAge: "1d" }));

  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }
    const indexPath = join(distPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err && !res.headersSent) {
        res.status(404).send("Not found");
      }
    });
  });

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[Error]", err.message || err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const PORT = process.env.PORT || 3001;
  const server = app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  let shuttingDown = false;
  const cleanup = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[Shutdown] ${signal} received`);

    const forceTimer = setTimeout(() => {
      console.error("[Shutdown] Forcing exit");
      process.exit(1);
    }, 10_000);

    server.close(async () => {
      try {
        stopScheduledSync();
        await closeAuth();
        await closePool();
      } catch {}
      clearTimeout(forceTimer);
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => cleanup("SIGTERM"));
  process.on("SIGINT", () => cleanup("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
