import mongoose, { Schema } from "mongoose";

// Schema definition for SOAP notes
const SOAPNoteSchema = new Schema(
  {
    patientId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    transcriptId: {
      type: String,
      required: true,
      index: true,
    },
    audioFileURL: {
      type: String,
      required: true,
    },
    soapCitations: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export const SOAPNote = mongoose.model("SOAPNote", SOAPNoteSchema);
