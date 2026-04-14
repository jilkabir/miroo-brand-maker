import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { analyzeBrand } from "@/lib/brand-analysis";
import { ResultHeader } from "@/components/result-header";
import { PaletteCard } from "@/components/palette-card";
import { SectionCard } from "@/components/section-card";
import { normalizeUrl } from "@/lib/url";

async function AnalyzeContent({ url }: { url: string }) {
  const report = await analyzeBrand(url);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-black/60 transition hover:text-ocean">
          Back
        </Link>
        <span className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-black/55">
          Generated Analysis
        </span>
      </div>

      <div className="space-y-6">
        <ResultHeader report={report} />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <SectionCard title="Brand Direction" eyebrow="Positioning">
            <div className="space-y-5">
              <div>
                <p className="text-sm text-black/55">Likely niche</p>
                <p className="mt-1 text-lg font-semibold">{report.niche}</p>
              </div>
              <div>
                <p className="text-sm text-black/55">Target audience</p>
                <p className="mt-1 text-base leading-7 text-black/70">{report.audience}</p>
              </div>
              <div>
                <p className="text-sm text-black/55">Personality</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.personality.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-sand px-3 py-2 text-sm font-medium text-ink"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Social Voice" eyebrow="Content">
            <div className="space-y-4">
              {report.socialTone.map((tone) => (
                <div key={tone} className="rounded-[1.4rem] bg-white p-4 text-sm leading-6 text-black/72">
                  {tone}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PaletteCard title="Current Color Signal" palette={report.currentPalette} />
          <PaletteCard title="Suggested Palette" palette={report.suggestedPalette} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Content Pillars" eyebrow="Strategy">
            <div className="space-y-3">
              {report.contentPillars.map((pillar) => (
                <div key={pillar} className="rounded-[1.4rem] bg-white p-4 text-sm leading-6 text-black/72">
                  {pillar}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Brand Recommendations" eyebrow="Next moves">
            <div className="space-y-3">
              {report.recommendations.map((recommendation) => (
                <div
                  key={recommendation}
                  className="rounded-[1.4rem] bg-white p-4 text-sm leading-6 text-black/72"
                >
                  {recommendation}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Social Media Content Ideas" eyebrow="Post planning">
          <div className="grid gap-4 md:grid-cols-3">
            {report.contentIdeas.map((idea) => (
              <article key={idea.title} className="rounded-[1.6rem] border border-black/8 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/90">
                  {idea.format}
                </p>
                <h4 className="mt-3 text-lg font-semibold">{idea.title}</h4>
                <p className="mt-3 text-sm leading-6 text-black/68">{idea.angle}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Sample Captions" eyebrow="Copy direction">
          <div className="grid gap-4 md:grid-cols-3">
            {report.sampleCaptions.map((caption) => (
              <blockquote key={caption} className="rounded-[1.6rem] bg-ink p-5 text-sm leading-6 text-white/80">
                {caption}
              </blockquote>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

export default async function AnalyzePage({
  searchParams
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const params = await searchParams;
  const normalized = normalizeUrl(params.url || "");

  if (!normalized) {
    redirect("/");
  }

  return (
    <Suspense fallback={<main className="p-10">Generating report...</main>}>
      <AnalyzeContent url={normalized} />
    </Suspense>
  );
}
