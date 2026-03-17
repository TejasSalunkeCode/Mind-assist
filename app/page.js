"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Image as ImageIcon, 
  Volume2, 
  Download, 
  Mic, 
  AlertCircle,
  PlusCircle,
  X,
  VolumeX
} from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { generateHealthReport } from "@/lib/report";

export default function Home() {
  const [messages, setMessages] = useState([
    { 
      role: "ai", 
      content: "Hello! I am your AI Health Assistant. Please upload an image of any skin concern or ask me a health-related question to get started.",
      id: "initial"
    }
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  
  const { speak, stop, isPlaying } = useVoice();
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage = { 
      role: "user", 
      content: input || "Analyzed this image", 
      id: Date.now().toString(),
      image: selectedImage 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          image: currentImage,
          language
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiMessage = { 
        role: "ai", 
        content: data.response, 
        id: (Date.now() + 1).toString() 
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (currentImage) {
        setAnalysisResult(data.response);
      }

      // Auto-speak the AI response if enabled
      if (isAutoSpeak) {
        speak(data.response, language);
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "I'm sorry, I encountered an error. Please try again.",
        id: Date.now().toString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReport = () => {
    const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
    generateHealthReport(analysisResult || "No analysis data available.", chatHistory, null);
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <AlertCircle size={24} color="#3b82f6" strokeWidth={2.5} />
          <span>HealthAI Chatbot</span>
        </div>
        <div className="controls">
          <button 
            onClick={() => setIsAutoSpeak(!isAutoSpeak)}
            className={`icon-btn ${!isAutoSpeak ? "muted" : ""}`}
            title={isAutoSpeak ? "Disable Auto-speak" : "Enable Auto-speak"}
          >
            {isAutoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          {isPlaying && (
            <button 
              onClick={stop}
              className="stop-btn"
              title="Stop current speech"
            >
              <div className="stop-square" />
              Stop
            </button>
          )}

          <div className="language-selector">
            {["English", "Hindi", "Marathi"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`lang-btn ${language === lang ? "active" : ""}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="chat-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.image && (
              <img src={msg.image} alt="Uploaded problem" className="preview-image" style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />
            )}
            <div className="message-text">{msg.content}</div>
            {msg.role === "ai" && (
              <button 
                className="speaker-btn"
                onClick={() => speak(msg.content, language)}
                title="Play voice"
              >
                <Volume2 size={16} />
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <div className="message-text">AI is thinking...</div>
          </div>
        )}
        {analysisResult && (
          <button className="report-btn" onClick={handleReport}>
            <Download size={18} /> Generate Health Report
          </button>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="input-area">
        <div className="disclaimer-banner">
          This AI tool provides general health guidance and should not replace professional medical advice.
        </div>
        
        {selectedImage && (
          <div className="preview-container">
            <img src={selectedImage} alt="Preview" className="preview-image" />
            <button className="icon-btn" onClick={() => setSelectedImage(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        <form className="input-container" onSubmit={handleSend}>
          <button 
            type="button" 
            className="icon-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={24} />
          </button>
          <input 
            type="file" 
            hidden 
            ref={fileInputRef} 
            accept="image/*"
            onChange={handleImageUpload}
          />
          <input
            className="chat-input"
            placeholder={`Message AI in ${language}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="send-btn" type="submit" disabled={isLoading}>
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
}
