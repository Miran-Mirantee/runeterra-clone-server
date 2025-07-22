const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const data = require("./data.json");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/translate", async (req, res) => {
  const { id, countryCode } = req.body;
  const item = data.find((d) => d.id === id);
  let language;

  switch (countryCode) {
    case "th":
      language = "Thai";
      break;
    case "jp":
      language = "Japanese";
      break;
    case "kr":
      language = "Korean";
      break;
    case "cn":
      language = "Chinese";
      break;

    default:
      break;
  }

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  try {
    const prompt = `Translate the following object to ${language}. ${JSON.stringify(
      item,
      null,
      2
    )}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-001",
      contents: prompt,
      config: {
        systemInstruction: `
        - The user will provide an object and ask you to translate.
        - Translate EVERY single values in the object, do NOT skip even one.
        - Do NOT translate object keys.
        - Always return the JSON result enclosed in a markdown fenced code block with the language identifier.
        - No additional explanations or comments—just the raw JSON.
        `,
      },
    });
    const text = response.text;
    const jsonText = text.replace(/^```json\s*/, "").replace(/```$/, "");

    res.json({ translated: JSON.parse(jsonText) });
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
