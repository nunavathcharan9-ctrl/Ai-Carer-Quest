import { NextResponse } from "next/server";

type CoachMessage = {
  role: "user" | "assistant";
  content: string;
};

type CoachRequest = {
  profile?: {
    interests?: string;
    skills?: string;
    education?: string;
    goals?: string;
  };
  quest?: {
    careerMatches?: string[];
    careerMilestones?: string[];
    skillGapAnalysis?: string[];
  };
  messages?: CoachMessage[];
};

export const runtime = "nodejs";

function fallbackCoachReply(request: CoachRequest): string {
  const profile = request.profile ?? {};
  const quest = request.quest ?? {};
  const latestUserMessage = request.messages?.filter((item) => item.role === "user").at(-1)?.content;
  const topMatch = quest.careerMatches?.[0] ?? "your target role";
  const firstMilestone = quest.careerMilestones?.[0] ?? "complete one focused learning sprint this week";
  const firstGap = quest.skillGapAnalysis?.[1] ?? "build deeper role-specific practice";

  return [
    `Great question. Based on your goal (${profile.goals ?? "career growth"}) and current skills (${profile.skills ?? "your current baseline"}), prioritize ${topMatch}.`,
    `Today action: ${firstMilestone}.`,
    `Main gap to close: ${firstGap}.`,
    latestUserMessage
      ? `For your specific ask ("${latestUserMessage}"), break it into a 30-minute task, a 2-hour task, and a weekly checkpoint.`
      : "Ask me for interview prep, project ideas, or a weekly schedule and I will tailor it.",
  ].join(" ");
}

async function fetchFoundryCoachResponse(request: CoachRequest): Promise<string | null> {
  const endpoint = process.env.FOUNDRY_IQ_ENDPOINT?.replace(/\/$/, "");
  const apiKey = process.env.FOUNDRY_IQ_API_KEY;
  const workspace = process.env.FOUNDRY_IQ_WORKSPACE;

  if (!endpoint) {
    return null;
  }

  const latestUserMessage = request.messages?.filter((item) => item.role === "user").at(-1)?.content ?? "Provide career coaching guidance.";

  const response = await fetch(`${endpoint}/query`, {
    method: "POST",
    signal: AbortSignal.timeout(12000),
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(workspace ? { "x-foundry-workspace": workspace } : {}),
    },
    body: JSON.stringify({
      query: `You are an AI career coach. Give a concise, actionable response to: ${latestUserMessage}`,
      context: {
        profile: request.profile,
        quest: request.quest,
        history: request.messages?.slice(-8),
      },
      topK: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Foundry IQ coach request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  if (typeof payload.answer === "string") {
    return payload.answer;
  }

  if (typeof payload.summary === "string") {
    return payload.summary;
  }

  if (typeof payload.response === "string") {
    return payload.response;
  }

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CoachRequest | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const foundryReply = await fetchFoundryCoachResponse(body);
    if (foundryReply) {
      return NextResponse.json({ reply: foundryReply, mode: "foundry" });
    }
  } catch {
    // Continue with fallback response when Foundry IQ is unavailable.
  }

  return NextResponse.json({ reply: fallbackCoachReply(body), mode: "demo" });
}
