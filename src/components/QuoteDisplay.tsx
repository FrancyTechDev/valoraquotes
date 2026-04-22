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
    .map((i) => `• ${i.name} — $${i.price.toFixed(2)}`)
    .join("\n")}\n\nTotal: $${quote.total.toFixed(2)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div id="quote-printable" className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">{quote.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{quote.description}</p>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          {quote.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-card-foreground">{item.name}</span>
              <span className="font-medium text-card-foreground">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 flex justify-between font-semibold">
          <span className="text-card-foreground">Total</span>
          <span className="text-primary">${quote.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1">
          <Printer className="w-4 h-4 mr-1" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
