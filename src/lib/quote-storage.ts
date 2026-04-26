import type { QuoteData } from "@/components/QuoteDisplay";

export interface SavedQuote {
  id: string;
  createdAt: string;
  quote: QuoteData;
}

const KEY = "valora_saved_quotes";

export function getSavedQuotes(): SavedQuote[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveQuote(quote: QuoteData): SavedQuote {
  const entry: SavedQuote = {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    quote,
  };
  const list = [entry, ...getSavedQuotes()];
  localStorage.setItem(KEY, JSON.stringify(list));
  return entry;
}

export function updateSavedQuote(id: string, quote: QuoteData) {
  const list = getSavedQuotes().map((q) => (q.id === id ? { ...q, quote } : q));
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteSavedQuote(id: string) {
  const list = getSavedQuotes().filter((q) => q.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getSavedQuote(id: string): SavedQuote | undefined {
  return getSavedQuotes().find((q) => q.id === id);
}
