import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MODEL_NAME = "gemini-2.5-flash"; // Try this one.  If it fails, try "gemini-pro" or other alternatives.

app.post("/api/translate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: "Why is the sky blue?",
    });
    const text = response.text;

    res.json({ text });
  } catch (error) {
    console.error("Gemini error:", error);
    res
      .status(500)
      .json({ error: "Gemini request failed", details: error.message });
  }
});

app.listen(3001, () => {
  console.log("✅ Gemini backend running at http://localhost:3001");
});
