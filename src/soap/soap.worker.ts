import { Job } from "bullmq";
import { redisClient } from "../redis/redis.client";
import { SOAPService } from "./soap.service";
import { SOAPScribeAgent } from "./soap_scribe.agent";
import { notificationService } from "../notification/notification.service";

export const soapNoteGenerateWorker = async (job: Job) => {

    const soapService = new SOAPService(new SOAPScribeAgent());

    console.log(`Processing job ${job.id} in queue soap_generate_queue`);
    const transcriptionId = job.data.transcriptionId;
    
    const transcription = await redisClient.get(transcriptionId);

    console.log(`Transcription: \n${transcription}`);

    if (!transcription) {
        console.error(`Transcription not found with id ${transcriptionId} for job ${job.id}`);
        return;
    }
    
    const soapNote = await soapService.generateSOAPNote(transcription);

    console.log(`SOAP Note: \n${soapNote}`);

    if (soapNote) {
        // @ts-ignore
        const rawText = soapNote.rawText;
        await soapService.saveSOAPNote(rawText, transcriptionId, "https://example.com/audio.mp3", {});
    }

    console.log(`SOAP Note: ${soapNote}`);


    notificationService.sendMessage("1", {
        type: "soap_note_generated",
        transcriptionId: transcriptionId
    });

}