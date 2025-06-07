import OpenAI from "openai";
import { SOAP_NOTE_OUTPUT_SCHEMA, SOAP_SCRIBE_SYSTEMP_PROMPT } from "./prompts";

export class SOAPScribeAgent {
  openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  generateSOAPNote = async (transcript: string) => {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SOAP_SCRIBE_SYSTEMP_PROMPT,
          },
          {
            role: "user",
            content:
              "Here is the transcript for which I need to generate a SOAP note: <transcript>" +
              transcript +
              "</transcript>",
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "soap_note",
            schema: SOAP_NOTE_OUTPUT_SCHEMA,
          },
        },
      });
      console.log("Response: ", response.choices[0].message.content);
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error generating SOAP note:", error);
      throw error;
    }
  };
}
