import express from "express";
import multer from "multer";
import { analyzeEDI, askCopilot } from "../services/geminiService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze-edi", upload.single("ediFile"), async (req, res) => {
  console.log("Analyze EDI route hit");
  try {
    if (!req.file) {
      console.log("No file was attached to the request.");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`Received file: ${req.file.originalname}, Size: ${req.file.size} bytes`);
    const fileContent = req.file.buffer.toString("utf-8");
    
    if (!fileContent.trim()) {
      return res.status(400).json({ error: "Uploaded file is empty" });
    }

    console.log("Calling Gemini analyzeEDI...");
    const analysisResult = await analyzeEDI(fileContent);
    console.log("Gemini parse successful.");

    res.json(analysisResult);
  } catch (error) {
    console.error("EDI Analysis Route Error:", error);
    res.status(500).json({ error: error.message || "Failed to process EDI file" });
  }
});

router.post("/ask-copilot", async (req, res) => {
  try {
    const { messages, parsed, issues } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const responseText = await askCopilot(messages, parsed, issues);
    res.json({ text: responseText });
  } catch (error) {
    console.error("Ask Copilot Route Error:", error);
    res.status(500).json({ error: error.message || "Failed to get AI response" });
  }
});

export default router;
