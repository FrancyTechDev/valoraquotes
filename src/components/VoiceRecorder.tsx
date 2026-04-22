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
      <p className="text-muted-foreground text-center">
        Il riconoscimento vocale non è supportato in questo browser. Usa Chrome o Edge.
      </p>
    );
  }

  const progress = seconds / 90;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Language selector */}
      <div className="flex items-center gap-1.5 bg-muted rounded-full p-1">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            disabled={isRecording}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              lang === l.code
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            } disabled:opacity-50`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Record button with circular progress */}
      <div className="relative">
        {isRecording && (
          <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill="none" stroke="var(--color-border)" strokeWidth="3" />
            <circle
              cx="48" cy="48" r="44" fill="none"
              stroke="var(--color-destructive)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
              className="transition-all duration-1000"
            />
          </svg>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
            isRecording
              ? "bg-destructive/10 text-destructive"
              : "bg-foreground text-background hover:scale-105 shadow-lg shadow-foreground/10"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? <Square className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {isRecording ? `${seconds}s / 90s` : "Tocca per registrare"}
        </p>

        {isRecording && interim && (
          <p className="text-sm text-muted-foreground/70 italic max-w-sm text-center leading-relaxed">
            {interim}
          </p>
        )}
      </div>

      {errorMsg && (
        <p className="text-sm text-destructive text-center max-w-sm">{errorMsg}</p>
      )}
    </div>
  );
}
