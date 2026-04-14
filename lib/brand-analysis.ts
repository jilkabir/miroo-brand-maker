import { buildMockReport } from "@/lib/mock-report";
import { buildSiteIntel } from "@/lib/site-intel";
import { BrandReport } from "@/lib/types";

export async function analyzeBrand(url: string): Promise<BrandReport> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildMockReport(url);
  }

  try {
    const siteIntel = buildSiteIntel(url);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You are a brand strategist. Return valid JSON only. Analyze the given website hostname and infer a likely digital branding direction. Include siteName, niche, personality array, audience, summary, currentPalette, suggestedPalette, contentPillars, socialTone, contentIdeas, sampleCaptions, recommendations. Each palette item must include label, hex, usage. Each content idea must include title, format, angle."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Website to analyze: ${url}. Normalized site intel: ${JSON.stringify(siteIntel)}.`
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "brand_report",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                siteName: { type: "string" },
                niche: { type: "string" },
                personality: { type: "array", items: { type: "string" } },
                audience: { type: "string" },
                summary: { type: "string" },
                currentPalette: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      label: { type: "string" },
                      hex: { type: "string" },
                      usage: { type: "string" }
                    },
                    required: ["label", "hex", "usage"]
                  }
                },
                suggestedPalette: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      label: { type: "string" },
                      hex: { type: "string" },
                      usage: { type: "string" }
                    },
                    required: ["label", "hex", "usage"]
                  }
                },
                contentPillars: { type: "array", items: { type: "string" } },
                socialTone: { type: "array", items: { type: "string" } },
                contentIdeas: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      title: { type: "string" },
                      format: { type: "string" },
                      angle: { type: "string" }
                    },
                    required: ["title", "format", "angle"]
                  }
                },
                sampleCaptions: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } }
              },
              required: [
                "siteName",
                "niche",
                "personality",
                "audience",
                "summary",
                "currentPalette",
                "suggestedPalette",
                "contentPillars",
                "socialTone",
                "contentIdeas",
                "sampleCaptions",
                "recommendations"
              ]
            }
          }
        }
      })
    });

    if (!response.ok) {
      return buildMockReport(url);
    }

    const data = await response.json();
    const raw = data.output_text || data.output?.[0]?.content?.[0]?.text;

    if (!raw) {
      return buildMockReport(url);
    }

    return {
      ...JSON.parse(raw),
      url
    } as BrandReport;
  } catch {
    return buildMockReport(url);
  }
}
