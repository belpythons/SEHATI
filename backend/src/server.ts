import { app } from "./app";
import { prisma } from "./utils/prisma";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`SEHATI Backend Gateway running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Server shutting down");
  await prisma.$disconnect();
  server.close();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);