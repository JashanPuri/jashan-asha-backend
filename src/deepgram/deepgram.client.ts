import {
  createClient,
  ListenLiveClient,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";

export class DeepgramClient {
  private deepgramClient;
  private deepgram: ListenLiveClient;

  constructor() {
    this.deepgramClient = createClient({
      key: process.env.DEEPGRAM_API_KEY,
    });
    this.deepgram = this.setupDeepgram();
  }

  private setupDeepgram = (): ListenLiveClient => {
    const deepgram: ListenLiveClient = this.deepgramClient.listen.live({
      language: "en",
      model: "nova-2",
      smart_format: true,
      punctuation: true,
    });

    const keepAlive = setInterval(() => {
      console.log("deepgram: keepalive");
      deepgram.keepAlive();
    }, 10 * 1000);

    deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
      console.log("deepgram: connected");

      deepgram.addListener(LiveTranscriptionEvents.Transcript, async (data) => {
        console.log("deepgram: packet received");
        console.log("deepgram: transcript received", JSON.stringify(data));
      });

      deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
        console.log("deepgram: disconnected");
        clearInterval(keepAlive);
        deepgram.requestClose();
      });

      deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
        console.log("deepgram: error received");
        console.error(error);
      });

      //   deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
      //     console.log("deepgram: packet received");
      //     console.log("deepgram: metadata received");
      //     console.log("ws: metadata sent to client");
      //     ws.send(JSON.stringify({ metadata: data }));
      //   });
    });

    return deepgram;
  };

  public sendAudioChunk = (chunk: ArrayBuffer) => {
    console.log("deepgram: sending audio chunk", chunk.byteLength);
    this.deepgram.send(chunk);
  };

  public closeConnection = () => {
    this.deepgram.requestClose();
  };
}
