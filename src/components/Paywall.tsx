import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check } from "lucide-react";
import { createCheckoutSession } from "@/server/stripe.functions";

export function Paywall({ count, limit }: { count: number; limit: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await createCheckoutSession({
        data: { origin: window.location.origin },
      });
      if (res.error || !res.url) {
        setError(res.error || "Impossibile avviare il checkout");
        setLoading(false);
        return;
      }
      window.location.href = res.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore");
      setLoading(false);
    }
  };

  return (
    <div className="text-center space-y-8 py-12">
      <div className="w-16 h-16 rounded-2xl bg-valora-green/10 flex items-center justify-center mx-auto">
        <Sparkles className="w-7 h-7 text-valora-green" />
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        <h2 className="text-3xl font-bold tracking-tight">
          Hai raggiunto il limite gratuito
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Hai usato {count} di {limit} preventivi gratuiti. Passa a Early Access per
          continuare a generare preventivi senza limiti.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-auto text-left space-y-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-valora-green mb-1">
            Early Access
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">€35</span>
            <span className="text-muted-foreground">/mese</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Prezzo bloccato per i primi utenti
          </p>
        </div>

        <ul className="space-y-2.5 text-sm">
          {[
            "Preventivi illimitati",
            "Tutti i preventivi salvati",
            "Modifiche e PDF illimitati",
            "Cancella in qualsiasi momento",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-valora-green flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-12 rounded-xl text-base"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Passa a Early Access"
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
