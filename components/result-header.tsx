import { BrandReport } from "@/lib/types";

export function ResultHeader({ report }: { report: BrandReport }) {
  return (
    <section className="panel rounded-[2.2rem] p-8 shadow-panel">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-ocean/70">
            Brand Intelligence
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {report.siteName}
          </h1>
          <p className="mt-3 text-base text-black/70">{report.summary}</p>
        </div>
        <div className="rounded-[1.6rem] bg-white px-5 py-4">
          <p className="text-sm text-black/55">Source URL</p>
          <p className="mt-1 font-medium">{report.url}</p>
        </div>
      </div>
    </section>
  );
}
