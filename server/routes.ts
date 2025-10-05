import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Video download endpoint
  app.get("/api/download", async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "Video URL is required" });
      }

      // Set headers for file download
      res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
      res.setHeader('Content-Type', 'video/mp4');
      
      // For a real implementation, you would fetch the video and stream it
      // For now, redirect to the video URL
      res.redirect(decodeURIComponent(url));
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: "Failed to download video" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "JW Player service is running" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
