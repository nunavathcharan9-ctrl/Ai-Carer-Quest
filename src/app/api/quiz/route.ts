import { NextResponse } from "next/server";

type QuizRequest = {
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

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export const runtime = "nodejs";

function fallbackQuiz(body: QuizRequest): QuizQuestion[] {
  const profile = body.profile ?? {};
  const goal = profile.goals ?? "career growth";
  const topRole = body.quest?.careerMatches?.[0] ?? "Product Designer";
  const topGap = body.quest?.skillGapAnalysis?.[1] ?? "advanced practical execution";

  return [
    {
      question: `What is the best first step if your goal is ${goal}?`,
      options: [
        "Apply to 100 random jobs immediately",
        "Pick one target role and build a focused project portfolio",
        "Learn every tool before doing any project",
        "Wait for opportunities without preparation",
      ],
      answerIndex: 1,
      explanation: "Focused role targeting plus proof-of-work is usually the fastest path.",
    },
    {
      question: `Which skill area should you prioritize for ${topRole}?`,
      options: [
        "Role-specific practical projects",
        "Only theory reading",
        "Unrelated certifications",
        "No skill update needed",
      ],
      answerIndex: 0,
      explanation: "Hands-on project evidence is a stronger signal than passive study.",
    },
    {
      question: "What cadence best improves interview readiness?",
      options: [
        "One mock interview every two months",
        "Daily random practice without feedback",
        "Weekly mock interviews with targeted feedback",
        "Only watch interview videos",
      ],
      answerIndex: 2,
      explanation: "Consistent weekly practice with feedback compounds quickly.",
    },
    {
      question: `Your biggest gap is ${topGap}. What should you do this week?`,
      options: [
        "Avoid difficult tasks",
        "Ship one mini-project that directly addresses the gap",
        "Switch goals entirely",
        "Wait until next month",
      ],
      answerIndex: 1,
      explanation: "A small shipped artifact creates real momentum and measurable progress.",
    },
  ];
}

async function fetchFoundryQuiz(body: QuizRequest): Promise<QuizQuestion[] | null> {
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
        "Create a 4-question career readiness quiz with multiple-choice options and one correct answer per question.",
      context: body,
      topK: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Foundry IQ quiz request failed with status ${response.status}`);
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
      if (typeof record.question !== "string" || !Array.isArray(record.options)) {
        return null;
      }

      const options = record.options.filter((value): value is string => typeof value === "string");
      if (options.length < 2) {
        return null;
      }

      return {
        question: record.question,
        options,
        answerIndex:
          typeof record.answerIndex === "number" && record.answerIndex >= 0
            ? record.answerIndex
            : 0,
        explanation:
          typeof record.explanation === "string"
            ? record.explanation
            : "This answer best aligns with role-focused career progression.",
      } satisfies QuizQuestion;
    })
    .filter((item): item is QuizQuestion => item !== null)
    .slice(0, 6);

  return parsed.length ? parsed : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as QuizRequest | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const foundryQuiz = await fetchFoundryQuiz(body);
    if (foundryQuiz) {
      return NextResponse.json({ questions: foundryQuiz, mode: "foundry" });
    }
  } catch {
    // Fall through to fallback quiz content.
  }

  return NextResponse.json({ questions: fallbackQuiz(body), mode: "demo" });
}
