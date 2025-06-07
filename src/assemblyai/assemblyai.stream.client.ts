import { WebSocket } from "ws";
import querystring from "querystring";

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || ""; // Replace with your actual API key
const CONNECTION_PARAMS = {
  sample_rate: 16000,
  format_turns: true, // Request formatted final transcripts
};
const API_ENDPOINT_BASE_URL = "wss://streaming.assemblyai.com/v3/ws";
const API_ENDPOINT = `${API_ENDPOINT_BASE_URL}?${querystring.stringify(
  CONNECTION_PARAMS
)}`;
const CHANNELS = 1;

export class AssemblyAIStreamClient {
  // private client: AssemblyAI;
  // private transcriber: StreamingTranscriber;
  private textChunksByTurns: Map<number, string>;

  private ws: WebSocket | null = null;

  constructor(textChunksByTurns: Map<number, string>) {
    this.textChunksByTurns = textChunksByTurns;
  }

  public connect = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(API_ENDPOINT, {
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
        },
      });

      console.log("Created AssemblyAI WebSocket client");

      this.ws.on('open', () => {
        console.log("WebSocket connection opened.");
        console.log(`Connected to: ${API_ENDPOINT}`);
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error(`\nWebSocket Error: ${error}`);
        reject(error);
      });

      this.setupHandlers();
    });
  }
    
  private cleanup() {
    // stopRequested = true;
    // Save recorded audio to WAV file
    // saveWavFile();
    // Stop microphone if it's running

    // Close WebSocket connection if it's open
    if (
      this.ws &&
      (this.ws.readyState == WebSocket.OPEN ||
        this.ws.readyState == WebSocket.CONNECTING)
    ) {
      try {
        // Send termination message if possible
        if (this.ws.readyState === WebSocket.OPEN) {
          const terminateMessage = { type: "Terminate" };
          console.log(
            `Sending termination message: ${JSON.stringify(terminateMessage)}`
          );
          this.ws.send(JSON.stringify(terminateMessage));
        }
        this.ws.close();
      } catch (error) {
        console.error(`Error closing WebSocket: ${error}`);
      }
    }
    console.log("Cleanup complete.");
  }

  private setupHandlers() {
    if (!this.ws) {
      console.error("WebSocket is not connected");
      return;
    }


    this.ws.on("open", () => {
      console.log("WebSocket connection opened.");
      console.log(`Connected to: ${API_ENDPOINT}`);
    });

    this.ws.on("message", (message: any) => {
      try {
        const data = JSON.parse(message);
        const msgType = data.type;

        if (msgType === "Begin") {
          const sessionId = data.id;
          const expiresAt = data.expires_at;
          console.log(
            `\nSession began: ID=${sessionId}, ExpiresAt=${expiresAt}`
          );

        } else if (msgType === "Turn") { 
          console.log("Turn:", data);
          const transcript = data.transcript || "";
          const formatted = data.turn_is_formatted;
          

          this.textChunksByTurns.set(data.turn_order, transcript);

          // if (formatted) {
          //   console.log("Formatted")
          //   process.stdout.write("\r" + " ".repeat(80) + "\r");
          //   console.log("Transcript: ", transcript);
          // } else {
          //   console.log("Not formatted")
          //   process.stdout.write(`\r${transcript}`);
          // }

        } else if (msgType === "Termination") {
          const audioDuration = data.audio_duration_seconds;
          const sessionDuration = data.session_duration_seconds;
          console.log(
            `\nSession Terminated: Audio Duration=${audioDuration}s, Session Duration=${sessionDuration}s`
          );
        }
      } catch (error) {
        console.error(`\nError handling message: ${error}`);
        console.error(`Message data: ${message}`);
      }
    });

    this.ws.on("error", (error) => {
      console.error(`\nWebSocket Error: ${error}`);
      this.cleanup();
    });

    this.ws.on("close", (code, reason) => {
      console.log(`\nWebSocket Disconnected: Status=${code}, Msg=${reason}`);
      this.cleanup();
    });
  }

  // constructor() {
  //   console.log("AssemblyAI API Key:", ASSEMBLYAI_API_KEY);
  //   this.client = new AssemblyAI({
  //     apiKey: process.env.ASSEMBLYAI_API_KEY || "",
  //   });

  //   this.transcriber = this.client.streaming.transcriber({
  //     sampleRate: 16000,
  //     formatTurns: true,
  //   });

  //   this.transcriber.on("open", ({ id }) => {
  //     console.log(`Session opened with ID: ${id}`);
  //   });

  //   this.transcriber.on("error", (error) => {
  //     console.error("Error:", error);
  //   });

  //   this.transcriber.on("close", (code, reason) =>
  //     console.log("Session closed:", code, reason)
  //   );

  //   this.transcriber.on("turn", (turn) => {
  //     console.log("Turn:", turn);
  //     if (!turn.transcript) {
  //       return;
  //     }
  //     console.log("Turn:", turn.transcript);
  //   });
  // }

  // public connect = async () => {
  //   await this.transcriber.connect();
  //   console.log("Connected to AssemblyAI");
  // };

  public sendAudioChunk = (chunk: any) => {
    if (!this.ws) {
      console.error("WebSocket is not connected");
      return;
    }
    this.ws.send(chunk);
  };

}
