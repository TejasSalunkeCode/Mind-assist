
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env' });

async function verify() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "You are a helpful health assistant."
  });

  // This matches the problematic history from the app
  const messages = [
    { role: "ai", content: "Hello! I am your AI Health Assistant..." },
    { role: "user", content: "hii" }
  ];

  try {
    // Apply the fix logic
    const formattedHistory = messages.slice(0, -1).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    let historyToUse = [];
    let lastRole = null;

    for (const msg of formattedHistory) {
      if (historyToUse.length === 0) {
        if (msg.role === "user") {
          historyToUse.push(msg);
          lastRole = "user";
        }
      } else {
        if (msg.role !== lastRole) {
          historyToUse.push(msg);
          lastRole = msg.role;
        }
      }
    }
    
    console.log("History to use:", JSON.stringify(historyToUse, null, 2));

    const chat = model.startChat({ history: historyToUse });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    console.log("Response SUCCESSFUL:", response.text());
  } catch (error) {
    console.error("VERIFICATION FAILED:");
    console.error("- Message:", error.message);
    if (error.response) {
      try {
        const body = await error.response.json();
        console.error("- Details:", JSON.stringify(body, null, 2));
      } catch (e) {
        console.error("- Body (Raw):", await error.response.text());
      }
    }
  }
}

verify();
