import { AssemblyAI } from "assemblyai";

export class AssemblyAIClient {
    private client: AssemblyAI;

    constructor() {
        this.client = new AssemblyAI({
            apiKey: process.env.ASSEMBLYAI_API_KEY || "",
        });
    }

    public transcribe = async (audio: any, options: any = {}) => {
        console.log("Transcribing audio:", audio.byteLength);
        const response = await this.client.transcripts.transcribe({
            audio: audio,
            ...options,
        });
        return response;
    }

}