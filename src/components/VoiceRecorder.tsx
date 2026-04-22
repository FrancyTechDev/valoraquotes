import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Globe } from "lucide-react";

const LANGUAGES = [
  { code: "it-IT", label: "IT" },
  { code: "en-US", label: "EN" },
  { code: "es-ES", label: "ES" },
  { code: "fr-FR", label: "FR" },
  { code: "de-DE", label: "DE" },
] as const;

function detectDefaultLang(): string {
  if (typeof navigator === "undefined") return "en-US";
  const nav = navigator.language || "en-US";
  const match = LANGUAGES.find((l) => nav.startsWith(l.code.slice(0, 2)));
  return match ? match.code : "en-US";
}

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [lang, setLang] = useState(detectDefaultLang);
  const [interim, setInterim] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const transcriptRef = useRef("");

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!supported) return;
    setErrorMsg("");
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    transcriptRef.current = "";

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }
      transcriptRef.current = finalText.trim();
      setInterim(interimText);
    };

    recognition.onerror = (e: any) => {
      const msg =
        e.error === "not-allowed"
          ? "Microfono non autorizzato. Controlla i permessi del browser."
          : e.error === "no-speech"
            ? "Nessun audio rilevato. Riprova parlando più forte."
            : `Errore: ${e.error}`;
      setErrorMsg(msg);
      stopRecording();
    };

    recognition.onend = () => {
      if (transcriptRef.current) {
        onTranscription(transcriptRef.current);
      }
      setIsRecording(false);
      setSeconds(0);
      setInterim("");
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
  }, [supported, onTranscription, lang]);

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
      {/* Language selector */}
      <div className="flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            disabled={isRecording}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              lang === l.code
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            } disabled:opacity-50`}
          >
            {l.label}
          </button>
        ))}
      </div>

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
        {isRecording ? `Registrazione... ${seconds}s / 90s` : "Tocca per registrare"}
      </p>

      {/* Live interim transcription */}
      {isRecording && interim && (
        <p className="text-xs text-muted-foreground/70 italic max-w-xs text-center animate-pulse">
          {interim}
        </p>
      )}

      {errorMsg && (
        <p className="text-sm text-destructive text-center max-w-xs">{errorMsg}</p>
      )}
    </div>
  );
}
