import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square } from "lucide-react";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const transcriptRef = useRef("");

  const supported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!supported) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    transcriptRef.current = "";

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      transcriptRef.current = text.trim();
    };

    recognition.onerror = () => {
      stopRecording();
    };

    recognition.onend = () => {
      if (transcriptRef.current) {
        onTranscription(transcriptRef.current);
      }
      setIsRecording(false);
      setSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s >= 89) {
          recognition.stop();
          return s;
        }
        return s + 1;
      });
    }, 1000);
  }, [supported, onTranscription]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  if (!supported) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        Speech recognition is not supported in this browser. Please use Chrome or Edge.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording
            ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/30"
            : "bg-primary text-primary-foreground hover:scale-105 shadow-md shadow-primary/20"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isRecording ? <Square className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
      </button>
      <p className="text-sm text-muted-foreground">
        {isRecording ? `Recording... ${seconds}s / 90s` : "Tap to start recording"}
      </p>
    </div>
  );
}
