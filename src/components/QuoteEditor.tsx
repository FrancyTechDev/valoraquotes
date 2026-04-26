import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { QuoteData } from "@/components/QuoteDisplay";

interface QuoteEditorProps {
  quote: QuoteData;
  onSave: (quote: QuoteData) => void;
  onCancel: () => void;
  saveLabel?: string;
}

function recalc(q: QuoteData): QuoteData {
  const sections = q.sections.map((s) => ({
    ...s,
    subtotal: s.items.reduce((sum, i) => sum + (Number(i.price) || 0), 0),
  }));
  const total = sections.reduce((sum, s) => sum + s.subtotal, 0);
  return { ...q, sections, total };
}

export function QuoteEditor({ quote, onSave, onCancel, saveLabel = "Salva" }: QuoteEditorProps) {
  const [draft, setDraft] = useState<QuoteData>(quote);

  const update = (patch: Partial<QuoteData>) => setDraft((d) => ({ ...d, ...patch }));

  const updateItem = (si: number, ii: number, field: "name" | "price", value: string) => {
    setDraft((d) => {
      const sections = d.sections.map((s, idx) => {
        if (idx !== si) return s;
        const items = s.items.map((it, jdx) =>
          jdx === ii ? { ...it, [field]: field === "price" ? Number(value) || 0 : value } : it
        );
        return { ...s, items };
      });
      return recalc({ ...d, sections });
    });
  };

  const addItem = (si: number) =>
    setDraft((d) => {
      const sections = d.sections.map((s, idx) =>
        idx === si ? { ...s, items: [...s.items, { name: "Nuova voce", price: 0 }] } : s
      );
      return recalc({ ...d, sections });
    });

  const removeItem = (si: number, ii: number) =>
    setDraft((d) => {
      const sections = d.sections.map((s, idx) =>
        idx === si ? { ...s, items: s.items.filter((_, jdx) => jdx !== ii) } : s
      );
      return recalc({ ...d, sections });
    });

  return (
    <div className="space-y-6">
      <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Titolo
          </label>
          <Input
            value={draft.title}
            onChange={(e) => update({ title: e.target.value })}
            className="h-11 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Descrizione
          </label>
          <Textarea
            value={draft.description}
            onChange={(e) => update({ description: e.target.value })}
            className="min-h-[80px] rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Durata
            </label>
            <Input
              value={draft.duration}
              onChange={(e) => update({ duration: e.target.value })}
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Livello finiture
            </label>
            <Input
              value={draft.finishLevel}
              onChange={(e) => update({ finishLevel: e.target.value })}
              className="h-11 rounded-lg"
            />
          </div>
        </div>
      </div>

      {draft.sections.map((section, si) => (
        <div key={si} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <Input
            value={section.name}
            onChange={(e) =>
              setDraft((d) => {
                const sections = d.sections.map((s, idx) =>
                  idx === si ? { ...s, name: e.target.value } : s
                );
                return { ...d, sections };
              })
            }
            className="h-10 rounded-lg font-semibold"
          />
          <div className="space-y-2">
            {section.items.map((item, ii) => (
              <div key={ii} className="flex gap-2 items-center">
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(si, ii, "name", e.target.value)}
                  className="flex-1 h-10 rounded-lg"
                  placeholder="Voce"
                />
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(si, ii, "price", e.target.value)}
                  className="w-28 h-10 rounded-lg tabular-nums"
                  placeholder="€"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(si, ii)}
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem(si)}
              className="w-full h-9 rounded-lg mt-2"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Aggiungi voce
            </Button>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border/50 text-sm">
            <span className="text-muted-foreground">Subtotale</span>
            <span className="font-semibold tabular-nums">€ {section.subtotal.toFixed(2)}</span>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center bg-card border border-border rounded-2xl p-6">
        <span className="font-bold">Totale</span>
        <span className="text-xl font-bold text-valora-green tabular-nums">
          € {draft.total.toFixed(2)}
        </span>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 h-12 rounded-xl">
          Annulla
        </Button>
        <Button onClick={() => onSave(draft)} className="flex-1 h-12 rounded-xl">
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
