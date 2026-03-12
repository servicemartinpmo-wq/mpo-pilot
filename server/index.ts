import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { setupAuth, closeAuth } from "./replitAuth";
import { closePool } from "./db";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "10mb" }));

let fatalShutdown: (() => void) | null = null;

process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err.message, err.stack);
  if (fatalShutdown) fatalShutdown();
  else process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled rejection:", reason);
});

async function main() {
  try {
    await setupAuth(app);
    console.log("[Auth] Setup complete");
  } catch (authError) {
    console.warn("[Auth] Setup failed, continuing without auth:", authError);
  }

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: Math.floor(process.uptime()),
      memory: Math.floor(process.memoryUsage().rss / 1024 / 1024),
    });
  });

  const distPath = join(__dirname, "../dist");
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
        await closeAuth();
        await closePool();
      } catch {}
      clearTimeout(forceTimer);
      process.exit(0);
    });
  };

  fatalShutdown = () => cleanup("uncaughtException");
  process.on("SIGTERM", () => cleanup("SIGTERM"));
  process.on("SIGINT", () => cleanup("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
