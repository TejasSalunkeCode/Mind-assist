import { GoogleGenerativeAI } from "@google/generative-ai";


export const analyzeImage = async (base64Image, language = "English") => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: {
      parts: [{ text: `Analyze this medical image of a skin condition. Respond in ${language}. Provide the response in the following format: 1. Possible disease name, 2. Description, 3. Causes, 4. Precautions, 5. Recommendation to consult a doctor. Disclaimer: This is AI-generated and not a substitute for professional medical advice.` }]
    }
  });

  if (!base64Image || !base64Image.includes(",")) {
    throw new Error("Invalid image format. Expected base64 with data prefix.");
  }

  const [prefix, data] = base64Image.split(",");
  const mimeType = prefix.match(/:(.*?);/)?.[1] || "image/jpeg";

  const imageData = {
    inlineData: {
      data: data,
      mimeType: mimeType,
    },
  };

  try {
    const result = await model.generateContent([imageData]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error (Image):", error);
    if (error.response) {
      console.error("Error Response Body:", await error.response.text());
    }
    throw error;
  }
};

export const chatWithAI = async (messages, language = "English") => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: API Key is missing in environment variables!");
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use 'gemini-flash-latest' which we saw in the list
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: `You are a helpful healthcare chatbot. Respond in ${language}. Tone: professional/empathetic. Note: You are an AI, user should consult a doctor.`
  });

  try {
    // History must start with user and alternate
    const formattedHistory = messages.slice(0, -1).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || " " }],
    }));

    let historyToUse = [];
    let lastRole = null;
    for (const msg of formattedHistory) {
      if (historyToUse.length === 0) {
        if (msg.role === "user") {
          historyToUse.push(msg);
          lastRole = "user";
        }
      } else if (msg.role !== lastRole) {
        historyToUse.push(msg);
        lastRole = msg.role;
      }
    }

    const chat = model.startChat({ history: historyToUse });
    const lastMessage = messages[messages.length - 1].content || " ";
    
    console.log(`DEBUG: Sending message to ${model.model} with ${historyToUse.length} history items.`);
    
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("--- GEMINI API ERROR START ---");
    console.error("Message:", error.message);
    if (error.stack) console.error("Stack:", error.stack);
    
    // Attempt to extract response details from the error object
    if (error.response) {
      try {
        const body = await error.response.text();
        console.error("Response Status:", error.response.status);
        console.error("Response Body:", body);
      } catch (e) {
        console.error("Could not read error response body.");
      }
    }
    console.error("--- GEMINI API ERROR END ---");
    throw error;
  }
};
