import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  transcription: z.string().min(1).max(2000),
});

export const generateQuote = createServerFn({ method: "POST" })
  .inputValidator((input: { transcription: string }) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { error: "AI service not configured" };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Sei un architetto professionista italiano con 15+ anni di esperienza in ristrutturazioni residenziali e nuove costruzioni. Il tuo compito è generare preventivi che siano INDISTINGUIBILI da quelli reali scritti da un professionista per un cliente pagante.

PRINCIPI FONDAMENTALI:
- Scrivi come un architetto, NON come un'intelligenza artificiale
- Ogni voce deve dimostrare conoscenza tecnica del settore edilizio
- Il documento deve essere pronto per essere inviato al cliente senza modifiche

REGOLE STRUTTURA:
1. TITOLO: Indica tipologia, metratura e zona/città se menzionata (es. "Ristrutturazione Integrale Appartamento 95mq — Roma, Zona Prati")
2. DESCRIZIONE: Max 2 righe, sintetica e professionale
3. DURATA: Realistica in base alla portata dei lavori
4. LIVELLO FINITURE: Specificare chiaramente (base/media/alta) con eventuali note su upgrade

SEZIONI OBBLIGATORIE (usa SOLO quelle pertinenti):
Le sezioni devono seguire la logica progettuale reale:

1. "Opere edili" — demolizioni, murature, massetti, contropareti, tracce
2. "Impianti" — elettrico (punti luce, quadro), idraulico (colonne, derivazioni), riscaldamento/clima
3. "Finiture interne" — pavimentazioni, rivestimenti, rasature, pitture, battiscopa
4. "Serramenti" — finestre, porte interne, portoncino, oscuranti, cassonetti
5. "Arredo fisso" — SOLO se esplicitamente richiesto dal cliente (cucina su misura, armadi a muro)
6. "Servizi professionali" — progettazione, direzione lavori, coordinamento sicurezza, pratiche edilizie

REGOLE CRITICHE DI DOMINIO:
- NON includere mobili o arredi a meno che il cliente li richieda esplicitamente
- Per le cucine: includere SOLO adeguamento impianti (gas, acqua, elettrico) e finiture pareti, NON i mobili della cucina
- Per i bagni: specificare sanitari, rubinetteria, rivestimenti, impianti — come voci separate o raggruppate logicamente
- Separare SEMPRE: opere edili vs impianti vs finiture
- Usare terminologia tecnica corretta (massetto, sottofondi, tracce, derivazioni, punti presa)

REGOLE PREZZI — FONDAMENTALE:
- MAI cifre tonde: NO 5.000, 10.000, 15.000, 20.000, 7.000
- Usare cifre credibili con variazione naturale: 4.850, 10.280, 7.350, 2.180, 15.720, 3.490
- I prezzi devono essere coerenti con:
  • La metratura del progetto
  • La zona geografica (Milano/Roma costano di più di provincia)
  • Il livello di finitura dichiarato
  • Il mercato edilizio italiano attuale
- Il subtotale di ogni sezione DEVE essere la somma esatta delle voci
- Il totale DEVE essere la somma esatta dei subtotali

GESTIONE INCERTEZZA:
Se il cliente esprime dubbi o indica fasce di prezzo:
- Riflettere l'incertezza nelle descrizioni delle voci
- Aggiungere note su possibili variazioni e upgrade disponibili
- Non essere troppo preciso dove il cliente è vago

TONO:
- Conciso ma autorevole
- Nessuna frase generica da AI
- Come un documento che un architetto freelance invierebbe a un cliente reale

NOTE FINALI (OBBLIGATORIE):
Includere sempre:
- Disclaimer sulla variabilità dei prezzi in fase esecutiva
- Dipendenza dalle scelte definitive dei materiali
- Esclusione di lavori non espressamente menzionati
- Possibilità di lavori aggiuntivi imprevisti (es. stato impianti esistenti)
- IVA esclusa (se applicabile)

VERIFICA FINALE (esegui mentalmente prima di rispondere):
- Nessuna voce duplicata
- Nessun errore logico (es. arredi inclusi senza richiesta)
- Tutti i componenti principali del progetto sono coperti
- I subtotali sono corretti
- Il totale è la somma dei subtotali

Return ONLY valid JSON with the exact structure specified in the tool schema.`,
          },
          {
            role: "user",
            content: data.transcription,
          },
        ],
        tools: [
          {
            type: "function" as const,
            function: {
              name: "generate_quote",
              description: "Generate a structured professional architectural quote",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Titolo professionale del progetto (es. 'Ristrutturazione Integrale Appartamento 95mq — Roma, Zona Prati')",
                  },
                  description: {
                    type: "string",
                    description: "Descrizione sintetica del progetto (max 2 righe)",
                  },
                  duration: {
                    type: "string",
                    description: "Durata stimata realistica (es. '10-12 settimane')",
                  },
                  finishLevel: {
                    type: "string",
                    description: "Livello finiture con eventuali note (es. 'Fascia media con possibilità di upgrade su rivestimenti bagno')",
                  },
                  sections: {
                    type: "array",
                    description: "Sezioni del preventivo organizzate per categoria di lavoro",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                          description: "Nome della sezione (es. 'Opere edili', 'Impianti', 'Finiture interne')",
                        },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: {
                                type: "string",
                                description: "Descrizione tecnica dettagliata della voce, incluso cosa comprende (es. 'Demolizione pavimenti e massetto esistente, smaltimento macerie (85mq)')",
                              },
                              price: {
                                type: "number",
                                description: "Prezzo in EUR — MAI cifre tonde, usare valori realistici con variazione naturale (es. 4.850, 10.280, 7.350)",
                              },
                            },
                            required: ["name", "price"],
                            additionalProperties: false,
                          },
                        },
                        subtotal: {
                          type: "number",
                          description: "Somma esatta dei prezzi delle voci nella sezione",
                        },
                      },
                      required: ["name", "items", "subtotal"],
                      additionalProperties: false,
                    },
                  },
                  total: {
                    type: "number",
                    description: "Somma esatta di tutti i subtotali delle sezioni",
                  },
                  notes: {
                    type: "array",
                    description: "Note professionali: variabilità prezzi, dipendenza materiali, esclusioni, IVA, lavori imprevisti",
                    items: {
                      type: "string",
                    },
                  },
                },
                required: ["title", "description", "duration", "finishLevel", "sections", "total", "notes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function" as const, function: { name: "generate_quote" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return { error: "Rate limited. Please try again in a moment." };
      if (response.status === 402) return { error: "AI credits exhausted. Please try again later." };
      return { error: "Failed to generate quote." };
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return { error: "Failed to parse AI response." };

    try {
      const quote = JSON.parse(toolCall.function.arguments);
      return { quote };
    } catch {
      return { error: "Failed to parse quote data." };
    }
  });
