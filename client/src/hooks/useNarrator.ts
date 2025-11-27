import { useEffect, useRef, useState } from "react";

export function useSpeechNarrator(text: string) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const detectLang = (text: string) => {
    if (/[\u0590-\u05FF]/.test(text)) return "he-IL";
    return "en-US";
  };

  // --- Select consistent voice ---
  const loadVoices = (lang: string) => {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null;

    const match = voices.find((v) => v.lang.startsWith(lang));
    return match || voices[0];
  };

  // --- Init Utterance ---
  useEffect(() => {
    const utter = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utter;

    const lang = detectLang(text);
    utter.lang = lang;
    utter.rate = 1;
    utter.pitch = 1;

    // Boundary event handler
    utter.onboundary = (event) => {
      if (event.name === "word") {
        setCurrentIndex(event.charIndex);
      }
    };
    utter.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utter.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentIndex(null);
    };
    const applyVoice = () => {
      const voice = loadVoices(lang);
      if (voice) {
        utter.voice = voice;
        setReady(true);
      }
    };

    // attempt immediate
    applyVoice();

    // load voices
    speechSynthesis.addEventListener("voiceschanged", applyVoice);

    return () => {
      speechSynthesis.cancel();
      speechSynthesis.removeEventListener("voiceschanged", applyVoice);
    };
  }, [text]);

  const speak = () => {
    const synth = speechSynthesis;
    const utter = utteranceRef.current;
    if (!utter) return;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      return;
    }
    if (isSpeaking) return;

    synth.cancel();
    setCurrentIndex(null);
    synth.speak(utter);
  };

  const pause = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPaused(false);
    setIsSpeaking(false);
    setCurrentIndex(null);
  };

  return { currentIndex, ready, speak, pause, stop, isPaused, isSpeaking };
}
