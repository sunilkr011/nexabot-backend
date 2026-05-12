import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const GROQ_MODEL = "llama-3.1-8b-instant";
