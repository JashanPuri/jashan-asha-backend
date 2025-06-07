import express, { Request, Response } from "express";
import http, { IncomingMessage } from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import config from "./config";
import { WebSocket, WebSocketServer } from "ws";
import connectDB from "./db/database";

// Import routes
import healthRoutes from "./routes/health.routes";
import apiRoutes from "./routes/api.routes";
import { TranscribeService } from "./transcribe/transcribe.service";
import { AssemblyAIClient } from "./assemblyai/assemblyai.client";
import { setupBullMQWorkers } from "./setup";
import { notificationService, NotificationService } from "./notification/notification.service";
// import { AssemblyAIStreamClient } from "./assemblyai/assemblyai.stream.client";

// Create Express app
let app = express();

const port = config.port;

// Connect to MongoDB
// connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to ASHA Healthcare API",
    status: "Server is running",
  });
});

// Health check route
app.use("/ping", healthRoutes);

// API Routes
app.use("/api/v1", apiRoutes);

const startServer = async () => {
  try {
    const server = http.createServer(app);

    await connectDB();

    const transcribeWSServer = new WebSocketServer({ noServer: true });
    const notificationWSServer = new WebSocketServer({ noServer: true });

    const transcribeService = new TranscribeService(new AssemblyAIClient());

    transcribeWSServer.on("connection", transcribeService.handleConnection.bind(transcribeService));
    notificationWSServer.on("connection", notificationService.handleConnection.bind(notificationService));

    await setupBullMQWorkers();

    server.on("upgrade", (request, socket, head) => {
      console.log("Upgrading to connection ws");
      console.log(request.url);
      const { pathname } = new URL(request.url ?? "/", 'ws://localhost:3000');
      if (pathname === "/transcribe") {
        console.log("Upgrading to transcribe connection ws");
        transcribeWSServer.handleUpgrade(request, socket, head, (ws) => {
          transcribeWSServer.emit("connection", ws, request);
        });

      } else if (pathname === "/notifications") {
        console.log("Upgrading to notification connection ws");
        notificationWSServer.handleUpgrade(request, socket, head, (ws) => {
          notificationWSServer.emit("connection", ws, request);
        });

      } else {
        socket.destroy();
      }
    });
    

    server.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      console.log(`Environment: ${config.env}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
