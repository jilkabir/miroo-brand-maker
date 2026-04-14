import { PaletteColor } from "@/lib/types";

export function PaletteCard({
  title,
  palette
}: {
  title: string;
  palette: PaletteColor[];
}) {
  return (
    <section className="panel rounded-[2rem] p-6 shadow-panel">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className="text-sm text-black/55">{palette.length} colors</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {palette.map((color) => (
          <div key={`${title}-${color.label}`} className="rounded-[1.5rem] border border-black/8 bg-white p-4">
            <div
              className="mb-4 h-20 rounded-[1.1rem]"
              style={{ backgroundColor: color.hex }}
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{color.label}</p>
                <p className="text-sm text-black/65">{color.usage}</p>
              </div>
              <code className="rounded-full bg-black/5 px-3 py-1 text-sm">{color.hex}</code>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
