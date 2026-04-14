import Link from "next/link";
import { UrlForm } from "@/components/url-form";

const features = [
  "Suggests a sharper brand palette from any website URL",
  "Builds content pillars and caption angles for social media",
  "Organized for future upgrades with Claude or any AI workflow"
];

export default function HomePage() {
  return (
    <main className="grain bg-hero-radial">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 md:px-10">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ocean/75">
              Miroo Brand Maker
            </p>
            <p className="mt-1 text-sm text-black/60">
              Website-to-brand strategy tool for founders and creators
            </p>
          </div>
          <Link
            href="#how-it-works"
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition hover:border-ocean hover:text-ocean"
          >
            How it works
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 pb-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/70">
              Analyze any homepage. Turn the vibe into a system.
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-ink md:text-7xl">
              Turn any website into a sharper brand palette and social content plan.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">
              Paste a URL and Miroo Brand Maker returns suggested colors, tone,
              content pillars, and caption ideas you can use for rebranding,
              pitching, or strategy work.
            </p>
            <div className="mt-8 max-w-3xl">
              <UrlForm />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-[1.5rem] border border-black/8 bg-white/70 p-4 text-sm leading-6 text-black/70"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="panel overflow-hidden rounded-[2.5rem] p-6 shadow-panel">
            <div className="rounded-[2rem] bg-ink p-6 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Sample result snapshot
              </p>
              <h2 className="mt-4 text-3xl font-semibold">Confident. Editorial. Warm.</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/72">
                Ideal for premium service brands that need trust, clarity, and a
                more recognizable social presence.
              </p>
              <div className="mt-6 flex gap-3">
                {["#0D3B66", "#F4D35E", "#EE6C4D", "#F7F4EA"].map((color) => (
                  <div
                    key={color}
                    className="h-16 w-full rounded-[1.2rem]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div id="how-it-works" className="mt-6 grid gap-4">
              {[
                "Paste a website URL",
                "Get a brand summary and suggested palette",
                "Use content ideas for Instagram, LinkedIn, or client strategy"
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-[1.5rem] bg-white p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-sm font-semibold text-ink">
                    0{index + 1}
                  </div>
                  <p className="text-sm font-medium text-black/72">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
