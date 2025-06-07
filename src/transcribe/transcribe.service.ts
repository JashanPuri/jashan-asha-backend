import { WebSocket } from "ws";
import { ApiError, internal } from "../utils/error.utils";
import { IncomingMessage } from "http";
import { SOAPScribeAgent } from "../soap/soap_scribe.agent";
import { redisClient } from "../redis/redis.client";
import { bullMQClient } from "../bullmq/bullmq.client";
import { AssemblyAIClient } from "../assemblyai/assemblyai.client";
import { AssemblyAIStreamClient } from "../assemblyai/assemblyai.stream.client";

const USE_STREAM = true;

export class TranscribeService {
  private static instance: TranscribeService;
  private connections: Map<string, WebSocket>;
  private assemblyAIClient: AssemblyAIClient;
  private audioChunks: Map<string, Buffer[]>;
  private transcribedTexts: Map<string, string>;
  // private assemblyAIStreamClient: AssemblyAIStreamClient;

  constructor(assemblyAIClient: AssemblyAIClient) {
    this.connections = new Map();
    this.assemblyAIClient = assemblyAIClient;
    this.audioChunks = new Map();
    this.transcribedTexts = new Map();
    // this.assemblyAIStreamClient = assemblyAIStreamClient;
  }

  //   /**
  //    * Get WebSocketService singleton instance
  //    */
  //   public static getInstance(): WebSocketService {
  //     if (!WebSocketService.instance) {
  //       WebSocketService.instance = new WebSocketService(
  //         new TranscribeService(new AssemblyAIStreamClient())
  //       );
  //     }
  //     return WebSocketService.instance;
  //   }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }

  private async generateTranscriptionFromAudioChunks(sessionId: string): Promise<any> {
    const audioChunks = this.audioChunks.get(sessionId);
    console.log("Audio chunks", audioChunks?.length);
    const audioBuffer = Buffer.concat(audioChunks || []);

    const transcription = await this.assemblyAIClient.transcribe(audioBuffer, {
      speaker_labels: true,
      speakers_expected: 2,
    });
    
    let transcriptionText = ""
    
    if (transcription.text) {
      console.log("Transcrioption text generated")
      transcriptionText = transcription.text;

    } else if (transcription.utterances) {
      console.log("Transcrioption utterances generated")
      const utterances = transcription.utterances;
      transcriptionText = utterances.map((utterance: any) => `${utterance.speaker}: ${utterance.text}`).join("\n");
    }
    
    this.transcribedTexts.set(sessionId, transcriptionText);
    return transcriptionText;
  }

  private buildTranscriptionFromStreamTurns(textChunksByTurns: Map<number, string>) {
    let transcriptionText = "";
    for (const [turn, text] of textChunksByTurns.entries()) {
      // TODO: Add speaker labels
      transcriptionText += `${text}\n`;
    }
    return transcriptionText;
  }

  private async invokeSoapNoteGeneration(
    transcriptionId: string
  ): Promise<void> {
    await bullMQClient.invokeJob("soap_generate_queue", { transcriptionId });
  }

  public async handleConnection(ws: WebSocket, req: IncomingMessage): Promise<void> {
    console.log("Connection received to WebSocket", req.headers);

    const sessionId = this.generateSessionId();
    this.audioChunks.set(sessionId, []);
    // this.textChunksByTurns
    this.transcribedTexts.set(sessionId, "");

    console.log("Connecting to AssemblyAI Stream Client");

    const textChunksByTurns = new Map<number, string>();

    const assemblyAIStreamClient = new AssemblyAIStreamClient(textChunksByTurns);

    await assemblyAIStreamClient.connect();
    
    console.log("Connected to AssemblyAI Stream Client");

    ws.send(JSON.stringify({ type: 'begin', sessionId }));

    ws.on("message", async (message: any) => {
      // console.log("Sending audio chunk to transcribeService", message);

      if (USE_STREAM) {
        assemblyAIStreamClient.sendAudioChunk(message);
      } else {
        this.audioChunks.get(sessionId)?.push(message);
      }
    });

    ws.on("close", async () => {
      console.log("Closing connection for session", sessionId);

      console.log("Text chunks by turns", textChunksByTurns);

      let transcription = "";

      if (USE_STREAM) {
        transcription = this.buildTranscriptionFromStreamTurns(textChunksByTurns);
      } else {
        transcription = await this.generateTranscriptionFromAudioChunks(sessionId);
      }

      const transcriptionId = `final_transcription_${sessionId}`;
      // Store transcription in Redis
      console.log("Storing transcription in Redis", transcriptionId);
      await redisClient.set(transcriptionId, transcription);

      // Push message to SOAP Consumer
      console.log("Invoking SOAP Note Generation", transcriptionId);
      await this.invokeSoapNoteGeneration(transcriptionId);
    });
  }

  public getWebSocket(id: string): WebSocket {
    const connection = this.connections.get(id);
    if (!connection) {
      throw internal(`WebSocket connection ${id} not found`);
    }
    return connection;
  }

  public sendTo(id: string, message: string): void {
    const ws = this.getWebSocket(id);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }

  public getConnections(): Map<string, WebSocket> {
    return this.connections;
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }
}
