import { getHostname } from "@/lib/url";

export type SiteIntel = {
  hostname: string;
  guessedCategory: string;
  notes: string[];
};

export function buildSiteIntel(url: string): SiteIntel {
  const hostname = getHostname(url);

  return {
    hostname,
    guessedCategory: "Website analysis placeholder",
    notes: [
      "Add homepage metadata scraping here in the next version.",
      "Add screenshot or logo color extraction here.",
      "Use this layer to normalize raw site signals before calling AI."
    ]
  };
}
