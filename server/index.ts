import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { setupAuth } from "./replitAuth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

async function main() {
  await setupAuth(app);

  // Serve static files from the Vite build output
  app.use(express.static(join(__dirname, "../dist")));

  // Fallback to index.html for client-side routing
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "../dist/index.html"));
  });

  const PORT = 3001;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
