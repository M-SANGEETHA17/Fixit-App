import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key:", apiKey);
  if (!apiKey) {
    console.error("No Gemini API key found!");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = "Hello, respond in one word.";
    const result = await model.generateContent(prompt);
    console.log("Result text:", result.response.text());
  } catch (err) {
    console.error("Gemini call failed with error:", err);
  }
}

test();
