import mongoose from "mongoose";

const researchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    abstract: { type: String },
    authors: [String],
    year: { type: Number },
    source: { type: String, enum: ["PubMed", "OpenAlex", "ClinicalTrials"] },
    url: { type: String },
    status: { type: String },
    location: { type: String },
    embedding: {
      type: [Number],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400,
    },
  },
  { timestamps: true },
);

const Research = mongoose.model("research", researchSchema);

export default Research;
