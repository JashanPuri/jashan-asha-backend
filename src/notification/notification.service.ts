import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { URL } from "url"; 

export class NotificationService {
  private connections: Map<string, WebSocket>;

  constructor() {
    this.connections = new Map();
  }

  public async handleConnection(ws: WebSocket, req: IncomingMessage): Promise<void> {
    const { pathname, searchParams } = new URL(req.url ?? "/", 'ws://localhost:3000');
    const doctorId = searchParams.get("doctorId");
    if (!doctorId) {
      ws.close();
      return;
    }
    console.log("Notification connection received", { doctorId });
    this.connections.set(doctorId, ws);

    console.log("Notification connection received", { doctorId });

    ws.on("close", () => {
      console.log("Notification connection closed", { doctorId });
      this.connections.delete(doctorId);
    });
  }

  public sendMessage(doctorId: string, message: any): void {
    const messageStr = JSON.stringify(message);
    const ws = this.connections.get(doctorId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("Sending message to doctor", { doctorId });
      ws.send(messageStr);
    }
  }
}

export const notificationService = new NotificationService();