import { BrandReport } from "@/lib/types";
import { getHostname } from "@/lib/url";

function titleFromHost(host: string): string {
  return host
    .split(".")[0]
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildMockReport(url: string): BrandReport {
  const host = getHostname(url);
  const siteName = titleFromHost(host);

  return {
    siteName,
    url,
    niche: "Modern service brand",
    personality: ["clean", "confident", "human", "strategic"],
    audience: "Founders and growing businesses who want a polished digital brand",
    summary:
      "Miroo sees a modern, service-led brand opportunity here. The recommended direction keeps the identity trustworthy and premium while making social content easier to scale across Instagram, LinkedIn, and short-form video.",
    currentPalette: [
      { label: "Detected Base", hex: "#1B1F3B", usage: "Header, logo, navigation" },
      { label: "Detected Accent", hex: "#F4A261", usage: "Buttons, highlights" },
      { label: "Detected Neutral", hex: "#FAF7F2", usage: "Background and breathing space" }
    ],
    suggestedPalette: [
      { label: "Primary", hex: "#0D3B66", usage: "Core brand color for authority" },
      { label: "Secondary", hex: "#F4D35E", usage: "Warm energy for contrast and CTAs" },
      { label: "Accent", hex: "#EE6C4D", usage: "Short bursts of attention on cards and social" },
      { label: "Neutral", hex: "#F7F4EA", usage: "Background, calm sections, templates" }
    ],
    contentPillars: [
      "Quick educational tips that simplify branding decisions",
      "Before and after design breakdowns",
      "Founder perspective and behind-the-scenes thinking",
      "Client trust stories, proof, and outcomes"
    ],
    socialTone: [
      "Clear and expert without sounding cold",
      "Visual, crisp, and easy to skim",
      "Helpful first, promotional second"
    ],
    contentIdeas: [
      {
        title: "3 color mistakes making your brand look inconsistent",
        format: "Instagram carousel",
        angle: "Teach a practical problem and show a cleaner alternative"
      },
      {
        title: `How ${siteName} could feel more premium in one screen`,
        format: "LinkedIn post",
        angle: "Use a mini teardown and explain the visual logic"
      },
      {
        title: "Palette of the week",
        format: "Reel or short-form video",
        angle: "Show color pairings, mood, and ideal brand use cases"
      }
    ],
    sampleCaptions: [
      "A strong brand color is not just pretty. It tells people how to feel before they read a single word.",
      "When your palette does the positioning work, your content becomes easier to recognize and easier to trust.",
      "Good branding feels intentional. Great branding feels inevitable."
    ],
    recommendations: [
      "Keep one dark anchor color for trust and one warm accent for memorability.",
      "Use template-based social design so every post looks related without feeling repetitive.",
      "Build a clearer voice system: educational, direct, and slightly editorial."
    ]
  };
}
