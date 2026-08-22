import "dotenv/config";
import { app } from "./app";
import { prisma } from "./utils/prisma";

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`SEHATI Backend Gateway running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Server shutting down...");
  try {
    server.close();
    await Promise.race([
      prisma.$disconnect(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  } catch {
    // ignore
  } finally {
    process.exit(0);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);