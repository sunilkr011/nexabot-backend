import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { errorHandler } from "./src/middleware/errorHandler.js";
import chatRoutes from "./src/routes/chatRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", chatRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "NexaBot Backend Running ✅" });
});

// Models list check karo
app.get("/models", async (req, res) => {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const result = await genAI.listModels();

    const models = [];

    for await (const model of result) {
      models.push(model.name);
    }

    res.json({ models });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/check-key", (req, res) => {
  res.json({
    key: process.env.GEMINI_API_KEY?.slice(0, 10) + "...",
  });
});

// Error Handler
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🤖 NexaBot Backend running on port ${PORT}`);
});
