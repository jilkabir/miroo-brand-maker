import { getHostname } from "@/lib/url";

export type SiteIntel = {
  hostname: string;
  siteName: string;
  title: string;
  description: string;
  topHeadings: string[];
  summaryText: string;
  detectedColors: string[];
  guessedCategory: string;
  notes: string[];
};

function cleanText(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHex(hex: string): string {
  const raw = hex.trim().replace("#", "");
  if (raw.length === 3) {
    return `#${raw
      .split("")
      .map((c) => `${c}${c}`)
      .join("")
      .toUpperCase()}`;
  }

  if (raw.length >= 6) {
    return `#${raw.slice(0, 6).toUpperCase()}`;
  }

  return "#1B1F3B";
}

function rgbToHex(rgbText: string): string | null {
  const parts = rgbText
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n));

  if (parts.length < 3) {
    return null;
  }

  const [r, g, b] = parts.map((n) => Math.min(255, Math.max(0, Math.round(n))));
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function extractColors(html: string): string[] {
  const colorCount = new Map<string, number>();
  const hexMatches = html.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const rgbMatches = [...html.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => m[1]);

  for (const match of hexMatches) {
    const hex = normalizeHex(match);
    colorCount.set(hex, (colorCount.get(hex) || 0) + 1);
  }

  for (const match of rgbMatches) {
    const hex = rgbToHex(match);
    if (!hex) {
      continue;
    }
    colorCount.set(hex, (colorCount.get(hex) || 0) + 1);
  }

  const blocked = new Set(["#FFFFFF", "#000000", "#F8F8F8", "#F5F5F5"]);
  return [...colorCount.entries()]
    .filter(([hex]) => !blocked.has(hex))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hex]) => hex);
}

function pickCategory(text: string): string {
  const corpus = text.toLowerCase();
  const rules: Array<{ label: string; keys: string[] }> = [
    { label: "SaaS or technology brand", keys: ["platform", "software", "dashboard", "api", "developer"] },
    { label: "E-commerce or consumer brand", keys: ["shop", "cart", "buy", "product", "shipping"] },
    { label: "Agency or service business", keys: ["services", "studio", "agency", "strategy", "consulting"] },
    { label: "Education or knowledge brand", keys: ["course", "learn", "academy", "training", "community"] },
    { label: "Healthcare or wellness brand", keys: ["health", "clinic", "care", "wellness", "medical"] }
  ];

  for (const rule of rules) {
    if (rule.keys.some((key) => corpus.includes(key))) {
      return rule.label;
    }
  }

  return "General digital brand";
}

function titleFromHost(host: string): string {
  return host
    .split(".")[0]
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function firstMatch(html: string, regex: RegExp): string {
  const result = html.match(regex);
  return result?.[1] ? cleanText(result[1]) : "";
}

export async function buildSiteIntel(url: string): Promise<SiteIntel> {
  const hostname = getHostname(url);
  const fallbackName = titleFromHost(hostname);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MirooBrandMaker/1.0 (+brand-analysis)"
      },
      cache: "no-store",
      redirect: "follow"
    });

    if (!response.ok) {
      return {
        hostname,
        siteName: fallbackName,
        title: fallbackName,
        description: "",
        topHeadings: [],
        summaryText: "",
        detectedColors: [],
        guessedCategory: "General digital brand",
        notes: [`Could not fetch page content (status ${response.status}).`]
      };
    }

    const html = (await response.text()).slice(0, 240000);
    const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || fallbackName;
    const description =
      firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i) ||
      firstMatch(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i);
    const siteName =
      firstMatch(html, /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i) ||
      title;
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
      .slice(0, 3)
      .map((m) => cleanText(m[1]))
      .filter(Boolean);
    const paragraphText = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .slice(0, 8)
      .map((m) => cleanText(m[1]))
      .filter((t) => t.length > 40 && t.length < 260)
      .slice(0, 4);
    const summaryText = paragraphText.join(" ").slice(0, 900);
    const detectedColors = extractColors(html);
    const guessedCategory = pickCategory(`${title} ${description} ${summaryText}`);

    return {
      hostname,
      siteName,
      title,
      description,
      topHeadings: h1Matches,
      summaryText,
      detectedColors,
      guessedCategory,
      notes: [
        "Parsed homepage HTML title, metadata, headings, and paragraph snippets.",
        "Detected likely CSS/inline colors from HTML content."
      ]
    };
  } catch {
    return {
      hostname,
      siteName: fallbackName,
      title: fallbackName,
      description: "",
      topHeadings: [],
      summaryText: "",
      detectedColors: [],
      guessedCategory: "General digital brand",
      notes: ["Page fetch failed. Using hostname-only fallback intel."]
    };
  }
}
