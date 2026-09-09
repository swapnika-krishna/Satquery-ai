import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
console.log("API key loaded:", !!process.env.GEMINI_API_KEY);
const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const question = req.body.question;

    const imageData = fs.readFileSync(imagePath).toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: imageData,
          },
        },
        {
          text: `You are SatQuery AI, an intelligent remote-sensing image analysis assistant.

Analyze this satellite image and answer the user's question.

User question:
${question}

Focus on:
- Water bodies
- Vegetation
- Buildings
- Roads
- Urban areas
- Agriculture
- Other visible land-cover features

Give a clear answer and mention uncertainty when something cannot be determined reliably.`,
        },
      ],
    });

    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      answer: response.text,
    });

  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("🚀 SatQuery backend running on http://localhost:5000");
});