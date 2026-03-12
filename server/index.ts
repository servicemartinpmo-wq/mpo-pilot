import express from "express";
import { setupAuth } from "./replitAuth";

const app = express();
app.use(express.json());

async function main() {
  await setupAuth(app);

  const PORT = 3001;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Auth server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start auth server:", err);
  process.exit(1);
});
