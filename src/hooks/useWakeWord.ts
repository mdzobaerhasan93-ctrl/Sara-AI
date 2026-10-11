import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWakeWordOptions {
  wakeWords?: string[];
  onWakeWordDetected: (detected: string) => void;
  isVoiceModalOpen: boolean;
  enabled?: boolean;
}

export function useWakeWord({
  wakeWords = ['hey sara', 'sara', 'সারা'],
  onWakeWordDetected,
  isVoiceModalOpen,
  enabled = false,
}: UseWakeWordOptions) {
  // Always default to false to prevent browser mic activation chimes ("টুনটুন" sound)
  const [isHandsFreeActive, setIsHandsFreeActive] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [lastDetected, setLastDetected] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isRunningRef = useRef<boolean>(false);
  const onWakeWordDetectedRef = useRef(onWakeWordDetected);
  onWakeWordDetectedRef.current = onWakeWordDetected;
  const wakeWordsRef = useRef(wakeWords);
  wakeWordsRef.current = wakeWords;

  // Clear any legacy auto-active flag from localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('sara_hands_free_active');
    } catch (e) {}
  }, []);

  const toggleHandsFree = useCallback(() => {
    setIsHandsFreeActive((prev) => {
      const next = !prev;
      if (!next && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        isRunningRef.current = false;
      }
      return next;
    });
  }, []);

  // Main Recognition Listener Lifecycle
  useEffect(() => {
    // If not manually activated or voice modal is already open, keep mic strictly stopped
    if (!isHandsFreeActive || isVoiceModalOpen || !enabled) {
      if (recognitionRef.current && isRunningRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        isRunningRef.current = false;
      }
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false; // Never use continuous auto-looping
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isRunningRef.current = true;
    };

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript.toLowerCase() + ' ';
      }

      let matchedWord: string | null = null;
      for (const word of wakeWordsRef.current) {
        if (fullTranscript.includes(word.toLowerCase().trim())) {
          matchedWord = word;
          break;
        }
      }

      if (!matchedWord && /hey\s*sara|হেই\s*সারা|সারা/i.test(fullTranscript)) {
        matchedWord = 'Hey SARA';
      }

      if (matchedWord) {
        setLastDetected(matchedWord);
        try {
          recognition.abort();
        } catch (e) {}
        isRunningRef.current = false;
        setIsHandsFreeActive(false); // Stop once detected
        onWakeWordDetectedRef.current(matchedWord);
      }
    };

    recognition.onerror = () => {
      isRunningRef.current = false;
    };

    recognition.onend = () => {
      isRunningRef.current = false;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      isRunningRef.current = false;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        isRunningRef.current = false;
      }
    };
  }, [isVoiceModalOpen, isHandsFreeActive, enabled]);

  return {
    isHandsFreeActive,
    toggleHandsFree,
    isSupported,
    lastDetected,
  };
}
