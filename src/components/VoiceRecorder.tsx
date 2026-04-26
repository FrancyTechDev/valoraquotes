import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square } from "lucide-react";

const LANGUAGES = [
  { code: "it-IT", label: "IT" },
  { code: "en-US", label: "EN" },
  { code: "es-ES", label: "ES" },
  { code: "fr-FR", label: "FR" },
  { code: "de-DE", label: "DE" },
] as const;

const MAX_SECONDS = 180;

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
  const [liveFinal, setLiveFinal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // Accumulated final transcript across auto-restarts
  const finalTranscriptRef = useRef("");
  // Final text already emitted by the current recognition session
  const sessionFinalRef = useRef("");
  // Whether we want recording to keep going (true until user stops or limit hit)
  const shouldContinueRef = useRef(false);
  const langRef = useRef(lang);
  langRef.current = lang;

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  };

  useEffect(() => {
    return () => {
      shouldContinueRef.current = false;
      cleanupTimer();
      try {
        recognitionRef.current?.abort();
      } catch {
        /* noop */
      }
    };
  }, []);

  const createRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langRef.current;
    sessionFinalRef.current = "";

    recognition.onresult = (event: any) => {
      let sessionFinal = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          sessionFinal += text + " ";
        } else {
          interimText += text;
        }
      }
      sessionFinalRef.current = sessionFinal;
      const combined = (finalTranscriptRef.current + " " + sessionFinal).trim();
      setLiveFinal(combined);
      setInterim(interimText);
    };

    recognition.onerror = (e: any) => {
      // "no-speech" / "aborted" are recoverable while we're still recording
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setErrorMsg("Microfono non autorizzato. Controlla i permessi del browser.");
        shouldContinueRef.current = false;
        return;
      }
      if (e.error === "network") {
        setErrorMsg("Problema di rete con il riconoscimento vocale. Riprovo...");
        return;
      }
      // Generic fallback — keep going if user hasn't stopped
      setErrorMsg(`Errore: ${e.error}. Riprovo...`);
    };

    recognition.onend = () => {
      // Persist whatever this session finalized
      if (sessionFinalRef.current) {
        finalTranscriptRef.current = (finalTranscriptRef.current + " " + sessionFinalRef.current).trim();
        sessionFinalRef.current = "";
      }

      if (shouldContinueRef.current) {
        // Browser auto-stopped (Chrome ~60s timeout). Restart silently.
        try {
          const next = createRecognition();
          recognitionRef.current = next;
          next.start();
        } catch {
          // If restart fails (rare), stop gracefully
          shouldContinueRef.current = false;
          finishRecording();
        }
      } else {
        finishRecording();
      }
    };

    return recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishRecording = useCallback(() => {
    cleanupTimer();
    const finalText = finalTranscriptRef.current.trim();
    setIsRecording(false);
    setInterim("");
    setSeconds(0);
    if (finalText) {
      onTranscription(finalText);
    }
  }, [onTranscription]);

  const startRecording = useCallback(() => {
    if (!supported) return;
    setErrorMsg("");
    setLiveFinal("");
    setInterim("");
    finalTranscriptRef.current = "";
    sessionFinalRef.current = "";
    shouldContinueRef.current = true;

    try {
      const recognition = createRecognition();
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setErrorMsg("Impossibile avviare la registrazione. Riprova.");
      shouldContinueRef.current = false;
      return;
    }

    setIsRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= MAX_SECONDS) {
          shouldContinueRef.current = false;
          try {
            recognitionRef.current?.stop();
          } catch {
            /* noop */
          }
          return MAX_SECONDS;
        }
        return next;
      });
    }, 1000);
  }, [supported, createRecognition]);

  const stopRecording = useCallback(() => {
    shouldContinueRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
  }, []);

  if (!supported) {
    return (
      <p className="text-muted-foreground text-center">
        Il riconoscimento vocale non è supportato in questo browser. Usa Chrome o Edge.
      </p>
    );
  }

  const progress = seconds / MAX_SECONDS;
  const livePreview = (liveFinal + (interim ? " " + interim : "")).trim();

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

      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-sm text-muted-foreground">
          {isRecording ? `${seconds}s / ${MAX_SECONDS}s` : "Tocca per registrare"}
        </p>

        {isRecording && livePreview && (
          <p className="text-sm text-muted-foreground/80 italic max-w-md text-center leading-relaxed max-h-32 overflow-y-auto">
            {livePreview}
          </p>
        )}
      </div>

      {errorMsg && (
        <p className="text-sm text-destructive text-center max-w-sm">{errorMsg}</p>
      )}
    </div>
  );
}
