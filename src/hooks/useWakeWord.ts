import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWakeWordOptions {
  wakeWords?: string[];
  onWakeWordDetected: (detected: string) => void;
  isVoiceModalOpen: boolean;
  enabled?: boolean;
}

export function useWakeWord({
  wakeWords = ['hey sara', 'sara', 'সারা', 'hello hello', 'hey zara', 'zara'],
  onWakeWordDetected,
  isVoiceModalOpen,
  enabled = true,
}: UseWakeWordOptions) {
  const [isHandsFreeActive, setIsHandsFreeActive] = useState<boolean>(() => {
    return localStorage.getItem('sara_hands_free_active') === 'true';
  });
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [lastDetected, setLastDetected] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isRunningRef = useRef<boolean>(false);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Silent chime to ensure zero annoying sounds
  const playWakeChime = useCallback(() => {
    // Sound disabled per user request
  }, []);

  const toggleHandsFree = useCallback(() => {
    setIsHandsFreeActive((prev) => {
      const next = !prev;
      localStorage.setItem('sara_hands_free_active', next.toString());
      return next;
    });
  }, []);

  // Main Recognition Listener Lifecycle
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    // Do not run background wake-word listener if voice modal is already open
    if (isVoiceModalOpen || !isHandsFreeActive || !enabled) {
      if (recognitionRef.current && isRunningRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) { }
        isRunningRef.current = false;
      }
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // handles Hey Sara, Hello Hello, etc.

    recognition.onstart = () => {
      isRunningRef.current = true;
    };

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript.toLowerCase() + ' ';
      }

      // Check standard wake words
      let matchedWord: string | null = null;
      for (const word of wakeWords) {
        const normalized = word.toLowerCase().trim();
        if (fullTranscript.includes(normalized)) {
          matchedWord = word;
          break;
        }
      }

      // Also check phonetic / bilingual variations (Hey Sara, Sara, সারা, Hey Zara)
      if (!matchedWord) {
        if (/hey\s*sara|hello\s*sara|হেই\s*সারা|সারা|hey\s*zara|hello\s*hello|hi\s*sara/i.test(fullTranscript)) {
          matchedWord = 'Hey SARA';
        }
      }

      if (matchedWord) {
        setLastDetected(matchedWord);
        playWakeChime();

        try {
          recognition.abort();
        } catch (e) { }
        isRunningRef.current = false;

        onWakeWordDetected(matchedWord);
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore routine aborts or non-fatal silences
      if (event.error === 'not-allowed') {
        setIsHandsFreeActive(false);
      }
    };

    recognition.onend = () => {
      isRunningRef.current = false;
      // Auto-restart if hands-free is enabled and voice modal is still closed
      if (isHandsFreeActive && !isVoiceModalOpen && enabled) {
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (e) { }
        }, 600);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Wake word recognition start warning:', e);
    }

    return () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) { }
        isRunningRef.current = false;
      }
    };
  }, [isVoiceModalOpen, isHandsFreeActive, enabled, wakeWords, onWakeWordDetected, playWakeChime]);

  return {
    isHandsFreeActive,
    toggleHandsFree,
    isSupported,
    lastDetected,
  };
}
