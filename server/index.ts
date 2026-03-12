import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { setupAuth, closeAuth } from "./replitAuth";
import { closePool } from "./db";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));

// Track request count for monitoring
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  if (requestCount % 1000 === 0) {
    console.log(`[Health] Processed ${requestCount} requests`);
  }
  next();
});

async function main() {
  try {
    await setupAuth(app);
  } catch (authError) {
    console.warn("[Auth] Setup failed, continuing without auth:", authError);
  }

  // API routes (before static files)
  app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Serve static files from the Vite build output
  const distPath = join(__dirname, "../dist");
  app.use(express.static(distPath, { 
    maxAge: "1d",
    etag: false 
  }));

  // Fallback to index.html for client-side routing
  app.use((req, res) => {
    const indexPath = join(distPath, "index.html");
    res.type("text/html");
    res.sendFile(indexPath, (err) => {
      if (err && !res.headersSent) {
        console.error("[Error] Failed to send index.html:", err.message);
        res.status(404).send("Not found");
      }
    });
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[Error]", err.message || err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  const cleanup = async () => {
    console.log("[Shutdown] Cleanup started...");
    server.close(() => {
      console.log("[Shutdown] Server closed");
    });
    try {
      await closeAuth();
      await closePool();
      console.log("[Shutdown] All resources cleaned up");
      process.exit(0);
    } catch (err) {
      console.error("[Shutdown] Error during cleanup:", err);
      process.exit(1);
    }
  };

  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
