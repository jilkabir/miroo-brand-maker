"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeUrl } from "@/lib/url";

export function UrlForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeUrl(url);

    if (!normalized) {
      return;
    }

    setLoading(true);
    router.push(`/analyze?url=${encodeURIComponent(normalized)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="panel rounded-[2rem] p-3 shadow-panel">
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="url"
          required
          placeholder="Paste a website URL like nike.com or yourclient.co"
          className="w-full rounded-[1.4rem] border border-black/10 bg-white px-5 py-4 text-base outline-none transition focus:border-coral"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-[1.4rem] bg-ink px-6 py-4 text-sm font-semibold text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Opening..." : "Analyze Brand"}
        </button>
      </div>
    </form>
  );
}
