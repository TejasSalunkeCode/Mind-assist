
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env' });

async function reproduce() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const messages = [
    { role: "ai", content: "Hello! I am your AI Health Assistant..." },
    { role: "user", content: "hii" }
  ];

  try {
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));
    
    console.log("History:", JSON.stringify(history, null, 2));

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("REPRODUCED ERROR:", error.message);
  }
}

reproduce();
