import { NextRequest, NextResponse } from "next/server";
import { analyzeBrand } from "@/lib/brand-analysis";
import { normalizeUrl } from "@/lib/url";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const url = normalizeUrl(body?.url || "");

  if (!url) {
    return NextResponse.json({ error: "A valid website URL is required." }, { status: 400 });
  }

  const report = await analyzeBrand(url);

  return NextResponse.json(report);
}
