import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import statsRoutes from "./routes/stats";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/stats", statsRoutes);

  // Additional routes can be added here
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
