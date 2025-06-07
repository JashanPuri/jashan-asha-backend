import { Router, Request, Response, NextFunction } from 'express';
import { soapController } from './soap.controller';

const router = Router();

// Get SOAP note by transcript ID
router.get('/:transcriptId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await soapController.getSOAPNote(req, res, next);
});

export default router;
