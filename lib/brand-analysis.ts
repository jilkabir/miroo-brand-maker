import { buildMockReport } from "@/lib/mock-report";
import { buildSiteIntel } from "@/lib/site-intel";
import { BrandReport, SocialPlatformPlan } from "@/lib/types";

function defaultSocialPlan(): SocialPlatformPlan[] {
  return [
    {
      platform: "Instagram",
      objective: "Grow visual identity recall",
      postingFrequency: "4 posts/week",
      formats: ["Carousel", "Reel"],
      contentMix: ["Educational tips", "Before-after", "Proof posts"],
      ctaStyle: "Save this post for your next brand update."
    },
    {
      platform: "Facebook",
      objective: "Trust-building with broad audience",
      postingFrequency: "3 posts/week",
      formats: ["Short video", "Image post", "Poll"],
      contentMix: ["How-to", "Community stories", "Offer reminder"],
      ctaStyle: "Comment your brand niche for a tailored suggestion."
    },
    {
      platform: "LinkedIn",
      objective: "Authority and inbound leads",
      postingFrequency: "3 posts/week",
      formats: ["Thought post", "Case insight", "Framework thread"],
      contentMix: ["Industry perspective", "Actionable framework", "Proof"],
      ctaStyle: "DM for a focused brand teardown."
    },
    {
      platform: "TikTok",
      objective: "Discovery through short-form education",
      postingFrequency: "4 videos/week",
      formats: ["Talking head", "Visual audit"],
      contentMix: ["Quick tips", "Brand reactions", "Mini CTA"],
      ctaStyle: "Follow for practical brand tips every week."
    }
  ];
}

function withSocialPlan(report: BrandReport): BrandReport {
  return {
    ...report,
    socialMediaPlan:
      report.socialMediaPlan && report.socialMediaPlan.length
        ? report.socialMediaPlan
        : defaultSocialPlan()
  };
}

function enrichWithAudit(report: BrandReport, siteIntel: Awaited<ReturnType<typeof buildSiteIntel>>): BrandReport {
  return withSocialPlan({
    ...report,
    colorAudit: {
      totalUniqueColors: siteIntel.allDetectedColors.length,
      scannedPageCount: siteIntel.scannedPages.length,
      scannedCssCount: siteIntel.scannedCssFiles.length,
      scannedPages: siteIntel.scannedPages,
      scannedCssFiles: siteIntel.scannedCssFiles,
      topColors: siteIntel.allDetectedColors.slice(0, 30),
      coverageNotes: siteIntel.notes
    }
  });
}

export async function analyzeBrand(url: string): Promise<BrandReport> {
  const apiKey = process.env.OPENAI_API_KEY;
  const siteIntel = await buildSiteIntel(url);

  if (!apiKey) {
    return enrichWithAudit(buildMockReport(url, siteIntel), siteIntel);
  }

  try {
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
                  "You are a brand strategist. Return valid JSON only. Use provided site intelligence as the source of truth, not generic assumptions. Use detected colors from intelligence when building currentPalette and suggestedPalette. Include siteName, niche, personality array, audience, summary, currentPalette, suggestedPalette, contentPillars, socialTone, socialMediaPlan, contentIdeas, sampleCaptions, recommendations. Each palette item must include label, hex, usage. Each content idea must include title, format, angle. socialMediaPlan must include Instagram, Facebook, LinkedIn, and TikTok objects with platform, objective, postingFrequency, formats, contentMix, ctaStyle."
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
                socialMediaPlan: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      platform: { type: "string" },
                      objective: { type: "string" },
                      postingFrequency: { type: "string" },
                      formats: { type: "array", items: { type: "string" } },
                      contentMix: { type: "array", items: { type: "string" } },
                      ctaStyle: { type: "string" }
                    },
                    required: [
                      "platform",
                      "objective",
                      "postingFrequency",
                      "formats",
                      "contentMix",
                      "ctaStyle"
                    ]
                  }
                },
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
                "socialMediaPlan",
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
      return enrichWithAudit(buildMockReport(url, siteIntel), siteIntel);
    }

    const data = await response.json();
    const raw = data.output_text || data.output?.[0]?.content?.[0]?.text;

    if (!raw) {
      return enrichWithAudit(buildMockReport(url, siteIntel), siteIntel);
    }

    return enrichWithAudit(
      {
        ...JSON.parse(raw),
        url
      } as BrandReport,
      siteIntel
    );
  } catch {
    return enrichWithAudit(buildMockReport(url, siteIntel), siteIntel);
  }
}
