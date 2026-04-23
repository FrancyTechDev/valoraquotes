import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { QuoteDisplay, type QuoteData } from "@/components/QuoteDisplay";
import { generateQuote } from "@/server/generate-quote.functions";
import { Button } from "@/components/ui/button";
import valoraLogo from "@/assets/valora-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VALORA — Preventivi Vocali Intelligenti" },
      { name: "description", content: "Genera preventivi professionali dalla tua voce in pochi secondi. Prova gratuita, nessun login richiesto." },
    ],
  }),
  component: Index,
});

const TRIAL_KEY = "valora_count";
const MAX_TRIALS = 3;

function getTrialCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(TRIAL_KEY) || "0", 10);
}

function incrementTrial() {
  const count = getTrialCount() + 1;
  localStorage.setItem(TRIAL_KEY, String(count));
  return count;
}

type Step = "record" | "edit" | "generating" | "result" | "blocked";

function Index() {
  const [step, setStep] = useState<Step>(() => (getTrialCount() >= MAX_TRIALS ? "blocked" : "record"));
  const [transcription, setTranscription] = useState("");
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [error, setError] = useState("");

  const handleTranscription = (text: string) => {
    setTranscription(text);
    setStep("edit");
  };

  const handleGenerate = async () => {
    if (!transcription.trim()) return;
    setStep("generating");
    setError("");

    try {
      const result = await generateQuote({ data: { transcription: transcription.trim().slice(0, 2000) } });
      if ("error" in result && result.error) {
        setError(result.error);
        setStep("edit");
        return;
      }
      if ("quote" in result && result.quote) {
        setQuote(result.quote as QuoteData);
        incrementTrial();
        setStep("result");
      }
    } catch {
      setError("Qualcosa è andato storto. Riprova.");
      setStep("edit");
    }
  };

  const handleReset = () => {
    if (getTrialCount() >= MAX_TRIALS) {
      setStep("blocked");
    } else {
      setTranscription("");
      setQuote(null);
      setError("");
      setStep("record");
    }
  };

  const remaining = MAX_TRIALS - getTrialCount();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header — large, clean, desktop-first */}
      <header className="border-b border-border/60 px-6 py-7 md:py-8 print:hidden backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={valoraLogo} alt="Valora" className="h-11 md:h-14 w-auto" />
          </div>
          {step !== "blocked" && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: MAX_TRIALS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < remaining ? "bg-valora-green" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                {remaining} {remaining === 1 ? "preventivo" : "preventivi"} rimanenti
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          {step === "record" && (
            <div className="text-center space-y-10">
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                  Descrivi il tuo progetto
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Registra un memo vocale e genereremo un preventivo professionale in pochi secondi.
                </p>
              </div>
              <VoiceRecorder onTranscription={handleTranscription} />
            </div>
          )}

          {step === "edit" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Rivedi la trascrizione</h2>
                <p className="text-muted-foreground">Modifica se necessario, poi genera il preventivo.</p>
              </div>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="w-full h-40 rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none transition-shadow"
                placeholder="La trascrizione apparirà qui..."
                maxLength={2000}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} className="flex-1 h-12 rounded-xl text-base">
                  Ricomincia
                </Button>
                <Button onClick={handleGenerate} disabled={!transcription.trim()} className="flex-1 h-12 rounded-xl text-base">
                  Genera Preventivo
                </Button>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="text-center space-y-6 py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">Generazione del preventivo in corso...</p>
            </div>
          )}

          {step === "result" && quote && (
            <div className="space-y-6">
              <QuoteDisplay quote={quote} />
              <Button variant="outline" onClick={handleReset} className="w-full h-12 rounded-xl text-base print:hidden">
                Nuovo Preventivo
              </Button>
            </div>
          )}

          {step === "blocked" && (
            <div className="text-center space-y-6 py-20">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto">
                <img src={valoraLogo} alt="Valora" className="h-10 w-auto opacity-40" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Trial terminato</h2>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  Hai utilizzato tutti i {MAX_TRIALS} preventivi gratuiti. Effettua l'upgrade per continuare.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 px-6 print:hidden">
        <p className="text-center text-xs text-muted-foreground/60">
          VALORA · Preventivi vocali intelligenti
        </p>
      </footer>
    </div>
  );
}
