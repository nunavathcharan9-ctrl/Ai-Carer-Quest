import { NextResponse } from "next/server";
import { buildCreativeRemix, type CreativeBrief } from "@/lib/creative-remix";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<CreativeBrief> | null;

  const remix = await buildCreativeRemix({
    prompt: body?.prompt ?? "",
    audience: body?.audience ?? "",
    format: body?.format ?? "",
    mood: body?.mood ?? "",
    medium: body?.medium ?? "",
  });

  return NextResponse.json({ remix });
}
