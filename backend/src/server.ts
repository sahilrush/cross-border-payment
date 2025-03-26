import app from "./app";
import prisma from "./config/db";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log("Connected to database successfully");

    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();
