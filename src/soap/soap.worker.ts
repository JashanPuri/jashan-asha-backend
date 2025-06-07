import { Job } from "bullmq";
import { redisClient } from "../redis/redis.client";
import { SOAPService } from "./soap.service";
import { SOAPScribeAgent } from "./soap_scribe.agent";
import { notificationService } from "../notification/notification.service";

const dummyTranscript = `
Speaker A: Good morning, Sarah. What brings you in today?
Speaker B: Hi Dr. Martinez. I've been having this persistent cough for about two weeks now, and it's getting worse. It's keeping me up at night.
Speaker A: I'm sorry to hear that. Can you describe the cough for me? Is it dry or are you bringing anything up?
Speaker B: It started dry, but now I'm coughing up some yellowish mucus. And my chest feels tight, especially in the mornings.
Speaker A: Any fever or chills?
Speaker B: I had a low-grade fever last week, maybe 100.5, but that's gone now. No chills.
Speaker A: How about shortness of breath or wheezing?
Speaker B: A little shortness of breath when I walk up stairs, but no wheezing that I've noticed.
Speaker A: Any recent travel or sick contacts?
Speaker B: My daughter had a cold about three weeks ago, but otherwise no.
Speaker A: Are you taking any medications currently?
Speaker B: Just my usual birth control pill and a daily multivitamin.
Speaker A: Any allergies to medications?
Speaker B: Penicillin gives me a rash.
Speaker A: Let me examine you. Your temperature today is 98.8, blood pressure 118/76, pulse 82, and oxygen saturation 97% on room air. [Examination sounds] I can hear some crackles in your lower right lung. Your throat looks a bit red, but not severely inflamed.
Speaker B: Is it serious?
Speaker A: It sounds like you may have developed a mild pneumonia, likely bacterial given the productive cough and the findings on exam. I'd like to get a chest X-ray to confirm and start you on an antibiotic. Since you're allergic to penicillin, I'll prescribe azithromycin.
Speaker B: How long will it take to get better?
Speaker A: You should start feeling better within 48-72 hours of starting the antibiotic. Take the full course even if you feel better. Also, get plenty of rest, stay hydrated, and you can use an over-the-counter cough suppressant at night to help you sleep.
Speaker B: Should I stay home from work?
Speaker A: Yes, I'd recommend staying home for at least the next 2-3 days, both to rest and to avoid spreading this to your coworkers. Come back if you're not improving in a week or if you develop high fever, severe shortness of breath, or chest pain.
Speaker B: Okay, thank you. When should I schedule a follow-up?
Speaker A: Let's plan on two weeks if you're feeling better, or sooner if you have any concerns. I'll send over the prescription and X-ray order now.
Speaker B: Great, thank you so much, Dr. Martinez.
`

const dummyTranscriptWithoutSpeakerLabels = `
Good morning, Sarah. What brings you in today? Hi Dr. Martinez. I've been having this persistent cough for about two weeks now, and it's getting worse. It's keeping me up at night. I'm sorry to hear that. Can you describe the cough for me? Is it dry or are you bringing anything up? It started dry, but now I'm coughing up some yellowish mucus. And my chest feels tight, especially in the mornings. Any fever or chills? I had a low-grade fever last week, maybe 100.5, but that's gone now. No chills. How about shortness of breath or wheezing? A little shortness of breath when I walk up stairs, but no wheezing that I've noticed. Any recent travel or sick contacts? My daughter had a cold about three weeks ago, but otherwise no. Are you taking any medications currently? Just my usual birth control pill and a daily multivitamin. Any allergies to medications? Penicillin gives me a rash. Let me examine you. Your temperature today is 98.8, blood pressure 118/76, pulse 82, and oxygen saturation 97% on room air. [Examination sounds] I can hear some crackles in your lower right lung. Your throat looks a bit red, but not severely inflamed. Is it serious? It sounds like you may have developed a mild pneumonia, likely bacterial given the productive cough and the findings on exam. I'd like to get a chest X-ray to confirm and start you on an antibiotic. Since you're allergic to penicillin, I'll prescribe azithromycin. How long will it take to get better? You should start feeling better within 48-72 hours of starting the antibiotic. Take the full course even if you feel better. Also, get plenty of rest, stay hydrated, and you can use an over-the-counter cough suppressant at night to help you sleep. Should I stay home from work? Yes, I'd recommend staying home for at least the next 2-3 days, both to rest and to avoid spreading this to your coworkers. Come back if you're not improving in a week or if you develop high fever, severe shortness of breath, or chest pain. Okay, thank you. When should I schedule a follow-up? Let's plan on two weeks if you're feeling better, or sooner if you have any concerns. I'll send over the prescription and X-ray order now. Great, thank you so much, Dr. Martinez.
`

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
        // @ts-ignore
        const citations = soapNote.citations;
        await soapService.saveSOAPNote(rawText, transcriptionId, "https://example.com/audio.mp3", citations);
    }

    // const soapNoteWithoutSpeakerLabels = await soapService.generateSOAPNote(dummyTranscriptWithoutSpeakerLabels);

    console.log(`SOAP Note: ${soapNote}`);

    // console.log(`SOAP Note without speaker labels: ${soapNoteWithoutSpeakerLabels}`);

    notificationService.sendMessage("1", {
        type: "soap_note_generated",
        transcriptionId: transcriptionId
    });

}