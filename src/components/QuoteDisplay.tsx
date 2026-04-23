import { Copy, Printer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface QuoteItem {
  name: string;
  price: number;
}

export interface QuoteSection {
  name: string;
  items: QuoteItem[];
  subtotal: number;
}

export interface QuoteData {
  title: string;
  description: string;
  duration: string;
  finishLevel: string;
  sections: QuoteSection[];
  total: number;
  notes: string[];
}

interface QuoteDisplayProps {
  quote: QuoteData;
}

function formatPrice(price: number): string {
  return price.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function QuoteDisplay({ quote }: QuoteDisplayProps) {
  const [copied, setCopied] = useState(false);

  const quoteText = [
    quote.title,
    quote.description,
    "",
    `Durata stimata: ${quote.duration}`,
    `Livello finiture: ${quote.finishLevel}`,
    "",
    ...quote.sections.flatMap((s) => [
      `— ${s.name} —`,
      ...s.items.map((i) => `  • ${i.name} — €${formatPrice(i.price)}`),
      `  Subtotale: €${formatPrice(s.subtotal)}`,
      "",
    ]),
    `TOTALE: €${formatPrice(quote.total)}`,
    "",
    "Note:",
    ...quote.notes.map((n) => `• ${n}`),
  ].join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div id="quote-printable" className="bg-card border border-border rounded-2xl p-8 md:p-10 space-y-8">
        {/* Header */}
        <div className="space-y-1.5 border-b border-border/50 pb-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-card-foreground">{quote.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{quote.description}</p>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Durata stimata</span>
            <p className="text-sm font-medium text-card-foreground">{quote.duration}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Livello finiture</span>
            <p className="text-sm font-medium text-card-foreground">{quote.finishLevel}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {quote.sections.map((section, si) => (
            <div key={si} className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-valora-green">{section.name}</h3>
              <div className="space-y-0">
                {section.items.map((item, ii) => (
                  <div key={ii} className="flex justify-between items-start py-2.5 border-b border-border/30 last:border-0 gap-4">
                    <span className="text-sm text-card-foreground leading-snug flex-1">{item.name}</span>
                    <span className="text-sm font-medium text-card-foreground tabular-nums whitespace-nowrap">€{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subtotale</span>
                <span className="text-sm font-semibold text-card-foreground tabular-nums">€{formatPrice(section.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t-2 border-valora-green/30 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-card-foreground">Totale Preventivo</span>
          <span className="text-xl font-bold text-valora-green tabular-nums">€{formatPrice(quote.total)}</span>
        </div>

        {/* Notes */}
        {quote.notes && quote.notes.length > 0 && (
          <div className="bg-muted/50 rounded-xl p-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Note</h4>
            <ul className="space-y-1.5">
              {quote.notes.map((note, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-muted-foreground/60 shrink-0">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3 print:hidden">
        <Button variant="outline" onClick={handleCopy} className="flex-1 h-11 rounded-xl">
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copiato" : "Copia"}
        </Button>
        <Button variant="outline" onClick={handlePrint} className="flex-1 h-11 rounded-xl">
          <Printer className="w-4 h-4 mr-2" />
          Scarica PDF
        </Button>
      </div>
    </div>
  );
}
