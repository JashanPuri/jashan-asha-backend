import { Job } from "bullmq";
import { bullMQClient } from "./bullmq/bullmq.client";
import { soapNoteGenerateWorker } from "./soap/soap.worker";

const QUEUE_WORKERS: Record<string, (job: Job) => Promise<void>> = {
    "soap_generate_queue": soapNoteGenerateWorker
};

export const setupBullMQWorkers = async () => {

    for (const queue of Object.keys(QUEUE_WORKERS)) {
        bullMQClient.addJobHandler(queue, QUEUE_WORKERS[queue]);
    }
}