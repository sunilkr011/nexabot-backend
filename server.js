import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./src/middleware/errorHandler.js";
import chatRoutes from "./src/routes/chatRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Sab allow karo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", chatRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "NexaBot Backend Running ✅" });
});

// Error Handler
app.use(errorHandler);

// Server
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 NexaBot Backend running on port ${PORT}`);
});
