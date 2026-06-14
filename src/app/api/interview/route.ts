import { NextResponse } from "next/server";

type InterviewRequest = {
  profile?: {
    interests?: string;
    skills?: string;
    education?: string;
    goals?: string;
  };
  quest?: {
    careerMatches?: string[];
    skillGapAnalysis?: string[];
  };
};

type InterviewQuestion = {
  question: string;
  focus: string;
  sampleStrongPoint: string;
};

export const runtime = "nodejs";

function fallbackInterviewQuestions(body: InterviewRequest): InterviewQuestion[] {
  const role = body.quest?.careerMatches?.[0] ?? "target role";
  const skills = body.profile?.skills ?? "your current skill stack";

  return [
    {
      question: `Why do you want to transition into ${role}?`,
      focus: "Motivation and role clarity",
      sampleStrongPoint:
        "Connect your long-term goals with concrete role responsibilities and recent projects.",
    },
    {
      question: "Tell me about a project where you solved a difficult problem.",
      focus: "Problem solving and impact",
      sampleStrongPoint:
        "Use STAR format with metrics: situation, actions, and measurable outcome.",
    },
    {
      question: `How do your current skills (${skills}) translate to this role?`,
      focus: "Skill transfer",
      sampleStrongPoint:
        "Map each existing skill to a role-relevant competency and give one real example.",
    },
    {
      question: "What is your 90-day plan if hired?",
      focus: "Execution planning",
      sampleStrongPoint:
        "Show onboarding speed, stakeholder alignment, and first milestone delivery.",
    },
    {
      question: "Describe a time you received critical feedback and how you acted on it.",
      focus: "Growth mindset",
      sampleStrongPoint:
        "Emphasize learning loop: feedback, adjustment, and improved outcome.",
    },
  ];
}

async function fetchFoundryInterviewQuestions(
  body: InterviewRequest,
): Promise<InterviewQuestion[] | null> {
  const endpoint = process.env.FOUNDRY_IQ_ENDPOINT?.replace(/\/$/, "");
  const apiKey = process.env.FOUNDRY_IQ_API_KEY;
  const workspace = process.env.FOUNDRY_IQ_WORKSPACE;

  if (!endpoint) {
    return null;
  }

  const response = await fetch(`${endpoint}/query`, {
    method: "POST",
    signal: AbortSignal.timeout(12000),
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(workspace ? { "x-foundry-workspace": workspace } : {}),
    },
    body: JSON.stringify({
      query:
        "Generate 5 personalized interview questions with focus and strong-answer hints for this candidate profile.",
      context: body,
      topK: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Foundry IQ interview request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const raw = payload.questions;

  if (!Array.isArray(raw)) {
    return null;
  }

  const parsed = raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      if (typeof record.question !== "string") {
        return null;
      }

      return {
        question: record.question,
        focus:
          typeof record.focus === "string"
            ? record.focus
            : "Role readiness and communication",
        sampleStrongPoint:
          typeof record.sampleStrongPoint === "string"
            ? record.sampleStrongPoint
            : "Structure your answer with concrete examples and outcomes.",
      } satisfies InterviewQuestion;
    })
    .filter((item): item is InterviewQuestion => item !== null)
    .slice(0, 8);

  return parsed.length ? parsed : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as InterviewRequest | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const foundryQuestions = await fetchFoundryInterviewQuestions(body);
    if (foundryQuestions) {
      return NextResponse.json({ questions: foundryQuestions, mode: "foundry" });
    }
  } catch {
    // Fall through to fallback interview content.
  }

  return NextResponse.json({ questions: fallbackInterviewQuestions(body), mode: "demo" });
}
