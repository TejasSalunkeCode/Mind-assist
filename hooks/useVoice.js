import { useState, useCallback } from "react";

export const useVoice = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = useCallback((text, language) => {
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on language
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (language === "Hindi") {
      selectedVoice = voices.find(v => v.lang.startsWith("hi"));
    } else if (language === "Marathi") {
      selectedVoice = voices.find(v => v.lang.startsWith("mr"));
    } else {
      selectedVoice = voices.find(v => v.lang.startsWith("en"));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return { speak, stop, isPlaying };
};
