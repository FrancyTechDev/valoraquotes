import { Copy, Printer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface QuoteData {
  title: string;
  description: string;
  items: { name: string; price: number }[];
  total: number;
}

interface QuoteDisplayProps {
  quote: QuoteData;
}

export function QuoteDisplay({ quote }: QuoteDisplayProps) {
  const [copied, setCopied] = useState(false);

  const quoteText = `${quote.title}\n${quote.description}\n\n${quote.items
    .map((i) => `• ${i.name} — €${i.price.toFixed(2)}`)
    .join("\n")}\n\nTotale: €${quote.total.toFixed(2)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div id="quote-printable" className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-card-foreground">{quote.title}</h2>
          <p className="text-muted-foreground">{quote.description}</p>
        </div>

        <div className="space-y-3">
          {quote.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-card-foreground">{item.name}</span>
              <span className="font-medium text-card-foreground tabular-nums">€{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-between items-center">
          <span className="text-lg font-semibold text-card-foreground">Totale</span>
          <span className="text-lg font-semibold text-valora-green tabular-nums">€{quote.total.toFixed(2)}</span>
        </div>
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
