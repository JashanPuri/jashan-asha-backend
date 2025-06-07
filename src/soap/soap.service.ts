import { SOAPNote } from "./soap.model";
import { SOAPScribeAgent } from "./soap_scribe.agent";

export class SOAPService {
  private soapScribeAgent: SOAPScribeAgent;

  constructor(soapScribeAgent: SOAPScribeAgent) {
    this.soapScribeAgent = soapScribeAgent;
  }

  public async generateSOAPNote(transcript: string): Promise<Object | null> {
    return await this.soapScribeAgent.generateSOAPNote(transcript);
  }

  public async saveSOAPNote(
    rawText: string,
    transcriptId: string,
    audioFileURL: string,
    soapCitations: Record<string, any>
  ): Promise<void> {
    const soapNoteModel = new SOAPNote({
      rawText: rawText,
      transcriptId: transcriptId,
      audioFileURL: audioFileURL,
      soapCitations: soapCitations,
      patientId: "1",
      doctorId: "1",
    });
    await soapNoteModel.save();
  }

  public async getSOAPNoteByTranscriptId(transcriptId: string) {
    const soapNote = await SOAPNote.findOne({ transcriptId });
    if (!soapNote) {
      throw new Error('NOT_FOUND');
    }
    return soapNote;
  }
}
