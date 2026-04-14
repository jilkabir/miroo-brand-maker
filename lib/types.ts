export type PaletteColor = {
  label: string;
  hex: string;
  usage: string;
};

export type ContentIdea = {
  title: string;
  format: string;
  angle: string;
};

export type BrandReport = {
  siteName: string;
  url: string;
  niche: string;
  personality: string[];
  audience: string;
  summary: string;
  currentPalette: PaletteColor[];
  suggestedPalette: PaletteColor[];
  contentPillars: string[];
  socialTone: string[];
  contentIdeas: ContentIdea[];
  sampleCaptions: string[];
  recommendations: string[];
};
