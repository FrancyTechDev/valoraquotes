import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { QuoteDisplay, type QuoteData } from "@/components/QuoteDisplay";
import { generateQuote } from "@/server/generate-quote.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoiceQuote — Generate Quotes from Voice" },
      { name: "description", content: "Instantly generate professional service quotes from voice input. Free trial, no login required." },
    ],
  }),
  component: Index,
});

const TRIAL_KEY = "voicequote_count";
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
      setError("Something went wrong. Please try again.");
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
      <header className="border-b border-border px-4 py-3 print:hidden">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground text-sm">VoiceQuote</span>
          </div>
          {step !== "blocked" && (
            <span className="text-xs text-muted-foreground">{remaining} free {remaining === 1 ? "quote" : "quotes"} left</span>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          {step === "record" && (
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Describe your project</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Record a voice memo and we'll generate a professional quote instantly.
                </p>
              </div>
              <VoiceRecorder onTranscription={handleTranscription} />
            </div>
          )}

          {step === "edit" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Review transcription</h2>
                <p className="text-sm text-muted-foreground">Edit if needed, then generate your quote.</p>
              </div>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="w-full h-32 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Your transcription will appear here..."
                maxLength={2000}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Start over
                </Button>
                <Button onClick={handleGenerate} disabled={!transcription.trim()} className="flex-1">
                  Generate Quote
                </Button>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="text-center space-y-4 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Generating your quote...</p>
            </div>
          )}

          {step === "result" && quote && (
            <div className="space-y-4">
              <QuoteDisplay quote={quote} />
              <Button variant="outline" onClick={handleReset} className="w-full print:hidden">
                New Quote
              </Button>
            </div>
          )}

          {step === "blocked" && (
            <div className="text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Trial finished</h2>
              <p className="text-sm text-muted-foreground">
                You've used all {MAX_TRIALS} free quotes. Upgrade to continue generating quotes.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
