import { NextResponse } from "next/server";
import { buildCreativeRemix, type CreativeBrief } from "@/lib/creative-remix";

export const runtime = "nodejs";

function asField(value: unknown) {
  return typeof value === "string" ? value.slice(0, 320).trim() : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const brief: CreativeBrief = {
    prompt: asField(body.prompt),
    audience: asField(body.audience),
    format: asField(body.format),
    mood: asField(body.mood),
    medium: asField(body.medium),
  };

  const remix = await buildCreativeRemix(brief);

  return NextResponse.json({ remix });
}
