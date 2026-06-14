import { NextResponse } from "next/server";
import { buildCareerQuest, type CareerProfile } from "@/lib/creative-remix";

export const runtime = "nodejs";

function asField(value: unknown) {
  return typeof value === "string" ? value.slice(0, 320).trim() : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const profile: CareerProfile = {
    interests: asField(body.interests),
    skills: asField(body.skills),
    education: asField(body.education),
    goals: asField(body.goals),
  };

  const remix = await buildCareerQuest(profile);

  return NextResponse.json({ remix });
}
