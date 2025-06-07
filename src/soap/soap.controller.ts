import { Request, Response, NextFunction } from 'express';
import { SOAPService } from './soap.service';
import { SOAPScribeAgent } from './soap_scribe.agent';

export class SOAPController {
  private soapService: SOAPService;

  constructor() {
    const soapScribeAgent = new SOAPScribeAgent();
    this.soapService = new SOAPService(soapScribeAgent);
  }

  public async getSOAPNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { transcriptId } = req.params;
      
      if (!transcriptId) {
        return res.status(400).json({ error: 'transcriptId is required' });
      }

      const soapNote = await this.soapService.getSOAPNoteByTranscriptId(transcriptId);
      return res.status(200).json(soapNote);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const soapController = new SOAPController();