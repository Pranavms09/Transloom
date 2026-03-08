import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run() {
  try {
    console.log("Calling gemini...");
    const result = await model.generateContent("Say hello");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Gemini failed:", e);
  }
}
run();
