import { getHostname, normalizeUrl } from "@/lib/url";

type FetchResult = {
  ok: boolean;
  status: number;
  text: string;
};

export type ColorCount = {
  hex: string;
  hits: number;
};

export type SiteIntel = {
  hostname: string;
  siteName: string;
  title: string;
  description: string;
  topHeadings: string[];
  summaryText: string;
  detectedColors: string[];
  allDetectedColors: ColorCount[];
  scannedPages: string[];
  scannedCssFiles: string[];
  guessedCategory: string;
  notes: string[];
};

const PAGE_LIMIT = 5;
const CSS_LIMIT = 8;
const HTML_CHAR_LIMIT = 320000;
const FETCH_TIMEOUT_MS = 12000;

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

function addColorHits(text: string, colorCount: Map<string, number>) {
  const hexMatches = text.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const rgbMatches = [...text.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => m[1]);

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
}

function sortColors(colorCount: Map<string, number>): ColorCount[] {
  return [...colorCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hex, hits]) => ({ hex, hits }));
}

function topSignalColors(colorStats: ColorCount[]): string[] {
  const blocked = new Set(["#FFFFFF", "#000000", "#F8F8F8", "#F5F5F5", "#111111"]);
  return colorStats
    .filter((color) => !blocked.has(color.hex))
    .slice(0, 8)
    .map((color) => color.hex);
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

async function fetchText(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MirooBrandMaker/1.0 (+brand-analysis)"
      },
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal
    });
    clearTimeout(timeout);
    return {
      ok: response.ok,
      status: response.status,
      text: (await response.text()).slice(0, HTML_CHAR_LIMIT)
    };
  } catch {
    clearTimeout(timeout);
    return {
      ok: false,
      status: 0,
      text: ""
    };
  }
}

function uniqueAbsoluteUrls(baseUrl: string, candidates: string[], sameHostOnly: boolean): string[] {
  const root = new URL(baseUrl);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (!trimmed || trimmed.startsWith("javascript:") || trimmed.startsWith("mailto:") || trimmed.startsWith("#")) {
      continue;
    }

    try {
      const absolute = new URL(trimmed, root).toString();
      const parsed = new URL(absolute);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        continue;
      }
      if (sameHostOnly && parsed.hostname !== root.hostname) {
        continue;
      }
      if (!seen.has(absolute)) {
        seen.add(absolute);
        out.push(absolute);
      }
    } catch {
      continue;
    }
  }

  return out;
}

function extractPageLinks(html: string, baseUrl: string): string[] {
  const hrefs = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const filtered = hrefs.filter((href) => !/\.(pdf|jpg|jpeg|png|webp|gif|svg|zip)$/i.test(href));
  return uniqueAbsoluteUrls(baseUrl, filtered, true);
}

function extractCssLinks(html: string, baseUrl: string): string[] {
  const hrefs = [...html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const cssOnly = hrefs.filter((href) => href.toLowerCase().includes(".css"));
  return uniqueAbsoluteUrls(baseUrl, cssOnly, false);
}

export async function buildSiteIntel(url: string): Promise<SiteIntel> {
  const normalizedUrl = normalizeUrl(url);
  const hostname = getHostname(normalizedUrl);
  const fallbackName = titleFromHost(hostname);
  const scannedPages: string[] = [];
  const scannedCssFiles: string[] = [];
  const notes: string[] = [];
  const colorCount = new Map<string, number>();

  const homeFetch = await fetchText(normalizedUrl);
  if (!homeFetch.ok || !homeFetch.text) {
    return {
      hostname,
      siteName: fallbackName,
      title: fallbackName,
      description: "",
      topHeadings: [],
      summaryText: "",
      detectedColors: [],
      allDetectedColors: [],
      scannedPages: [],
      scannedCssFiles: [],
      guessedCategory: "General digital brand",
      notes: [`Could not fetch page content (status ${homeFetch.status || "unknown"}).`]
    };
  }

  const homeHtml = homeFetch.text;
  scannedPages.push(normalizedUrl);
  addColorHits(homeHtml, colorCount);

  const pageQueue = extractPageLinks(homeHtml, normalizedUrl).slice(0, PAGE_LIMIT - 1);
  for (const pageUrl of pageQueue) {
    const pageFetch = await fetchText(pageUrl);
    if (!pageFetch.ok || !pageFetch.text) {
      continue;
    }
    scannedPages.push(pageUrl);
    addColorHits(pageFetch.text, colorCount);
  }

  const cssCandidates = [
    ...extractCssLinks(homeHtml, normalizedUrl),
    ...extractPageLinks(homeHtml, normalizedUrl).map((href) => `${href.replace(/\/$/, "")}/styles.css`)
  ];
  const cssQueue = uniqueAbsoluteUrls(normalizedUrl, cssCandidates, false).slice(0, CSS_LIMIT);
  for (const cssUrl of cssQueue) {
    const cssFetch = await fetchText(cssUrl);
    if (!cssFetch.ok || !cssFetch.text) {
      continue;
    }
    scannedCssFiles.push(cssUrl);
    addColorHits(cssFetch.text, colorCount);
  }

  const title = firstMatch(homeHtml, /<title[^>]*>([\s\S]*?)<\/title>/i) || fallbackName;
  const description =
    firstMatch(homeHtml, /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i) ||
    firstMatch(homeHtml, /<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i);
  const siteName =
    firstMatch(homeHtml, /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i) || title;
  const h1Matches = [...homeHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .slice(0, 4)
    .map((m) => cleanText(m[1]))
    .filter(Boolean);
  const paragraphText = [...homeHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .slice(0, 12)
    .map((m) => cleanText(m[1]))
    .filter((t) => t.length > 35 && t.length < 280)
    .slice(0, 6);
  const summaryText = paragraphText.join(" ").slice(0, 1200);
  const allDetectedColors = sortColors(colorCount);
  const detectedColors = topSignalColors(allDetectedColors);
  const guessedCategory = pickCategory(`${title} ${description} ${summaryText}`);

  notes.push(`Scanned ${scannedPages.length} page(s) and ${scannedCssFiles.length} CSS file(s).`);
  notes.push(
    allDetectedColors.length
      ? `Found ${allDetectedColors.length} unique color tokens in scanned content.`
      : "No color tokens detected from scanned content."
  );
  notes.push("Some JavaScript-rendered pages may expose fewer colors without browser rendering.");

  return {
    hostname,
    siteName,
    title,
    description,
    topHeadings: h1Matches,
    summaryText,
    detectedColors,
    allDetectedColors,
    scannedPages,
    scannedCssFiles,
    guessedCategory,
    notes
  };
}
