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
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a professional quote generator. Given a voice transcription describing a service request, generate a structured quote. Return ONLY valid JSON with this exact structure:
{
  "title": "Quote title",
  "description": "Brief description of the work",
  "items": [
    { "name": "Service item name", "price": 100 }
  ],
  "total": 300
}
Keep it concise. 3-6 items. Prices in USD. Total must equal sum of item prices.`,
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
              description: "Generate a structured service quote",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        price: { type: "number" },
                      },
                      required: ["name", "price"],
                      additionalProperties: false,
                    },
                  },
                  total: { type: "number" },
                },
                required: ["title", "description", "items", "total"],
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
