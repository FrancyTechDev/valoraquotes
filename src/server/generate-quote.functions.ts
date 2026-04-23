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
            content: `Sei un architetto professionista italiano con esperienza in ristrutturazioni e nuove costruzioni. Data una descrizione vocale di un progetto, genera un preventivo professionale dettagliato che un architetto invierebbe direttamente al cliente.

REGOLE FONDAMENTALI:
1. STRUTTURA: Organizza il preventivo in sezioni professionali con sottototali per ogni sezione.
2. DETTAGLIO VOCI: Ogni voce deve avere una breve descrizione realistica (1 riga) di cosa include. Non solo "Bagno — €15.000" ma "Rifacimento completo bagno (impianti, sanitari, rivestimenti ceramici) — €10.850".
3. PREZZI REALISTICI: MAI usare cifre tonde come 5.000, 10.000, 7.000. Usa cifre credibili: 4.800, 10.200, 7.350, 2.180. I prezzi devono essere coerenti con il mercato italiano.
4. INCERTEZZA: Se il cliente menziona incertezza o fasce di prezzo, aggiungi note su possibili variazioni e upgrade disponibili.
5. TONO PROFESSIONALE: Linguaggio chiaro, strutturato, credibile. Niente tono generico da AI.

SEZIONI OBBLIGATORIE (usa solo quelle pertinenti al progetto):
- Opere edili (demolizioni, murature, massetti)
- Impianti (elettrico, idraulico, riscaldamento)
- Finiture interne (pavimenti, rivestimenti, pitture)
- Serramenti (finestre, porte, oscuranti)
- Arredo fisso (cucina, armadi a muro) — se pertinente
- Servizi professionali (progettazione, direzione lavori, pratiche)

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
                    description: "Titolo del progetto (es. 'Ristrutturazione Appartamento 85mq — Milano, Zona Navigli')",
                  },
                  description: {
                    type: "string",
                    description: "Breve descrizione del progetto (2-3 righe max)",
                  },
                  duration: {
                    type: "string",
                    description: "Durata stimata dei lavori (es. '8-10 settimane')",
                  },
                  finishLevel: {
                    type: "string",
                    description: "Livello finiture (es. 'Fascia media con possibilità di upgrade')",
                  },
                  sections: {
                    type: "array",
                    description: "Sezioni del preventivo con voci dettagliate",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                          description: "Nome della sezione (es. 'Opere edili')",
                        },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: {
                                type: "string",
                                description: "Nome della voce con descrizione breve inclusa (es. 'Demolizione pavimenti esistenti e massetto (80mq circa)')",
                              },
                              price: {
                                type: "number",
                                description: "Prezzo in EUR — MAI cifre tonde, usa valori realistici (es. 4.800, 10.250)",
                              },
                            },
                            required: ["name", "price"],
                            additionalProperties: false,
                          },
                        },
                        subtotal: {
                          type: "number",
                          description: "Sottototale della sezione",
                        },
                      },
                      required: ["name", "items", "subtotal"],
                      additionalProperties: false,
                    },
                  },
                  total: {
                    type: "number",
                    description: "Totale generale del preventivo",
                  },
                  notes: {
                    type: "array",
                    description: "Note professionali (disclaimer variabilità, lavori aggiuntivi possibili, dipendenza da scelte materiali)",
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
