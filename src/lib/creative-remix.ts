export type CareerProfile = {
  interests: string;
  skills: string;
  education: string;
  goals: string;
};

export type InsightSource = {
  title: string;
  summary: string;
  citation: string;
};

export type CareerQuest = {
  title: string;
  logline: string;
  tagline: string;
  openingLine: string;
  careerMatches: string[];
  careerMilestones: string[];
  dailyMissions: string[];
  learningPath: string[];
  skillGapAnalysis: string[];
  careerSimulator: string;
  careerRoadmap: string;
  grounding: InsightSource[];
  mode: "foundry" | "demo";
};

function makeFoundryGroundingFallback(profile: CareerProfile): InsightSource[] {
  return [
    {
      title: "Foundry IQ session",
      summary: `Grounded career guidance generated for ${profile.goals} using skills from ${profile.skills}.`,
      citation: "Foundry IQ",
    },
  ];
}

const DEFAULT_INTERESTS = "technology, design, and problem-solving";

function sentenceCase(text: string) {
  const trimmed = text.trim();
  return trimmed.length ? trimmed[0].toUpperCase() + trimmed.slice(1) : trimmed;
}

function deriveTitle(interests: string, goals: string) {
  const fragment = goals
    .split(/[,.;:!?]/)[0]
    .split(/\s+/)
    .slice(0, 4)
    .join(" ");

  return `${sentenceCase(fragment || "Career Quest")} ${interests ? `for ${interests}` : ""}`
    .replace(/\s+/g, " ")
    .trim();
}

function makeFallbackGrounding(profile: CareerProfile): InsightSource[] {
  return [
    {
      title: "Interest Map",
      summary: `Your profile centers on ${profile.interests || DEFAULT_INTERESTS}. The quest aligns career choices to those themes.`,
      citation: "Local synthesis",
    },
    {
      title: "Skills Lens",
      summary: `Current strengths (${profile.skills || "foundational communication and digital skills"}) are used as your launch pad roles.`,
      citation: "Local synthesis",
    },
    {
      title: "Goal Alignment",
      summary: `Your goal (${profile.goals || "career growth"}) is translated into milestones and a practical roadmap.`,
      citation: "Local synthesis",
    },
  ];
}

export function buildFallbackCareerQuest(profile: CareerProfile): CareerQuest {
  const title = deriveTitle(profile.interests, profile.goals);

  return {
    title,
    logline: `A guided career quest for ${profile.goals || "growth-minded learners"}, grounded in ${profile.interests || DEFAULT_INTERESTS}.`,
    tagline: "Turn your profile into a concrete career roadmap.",
    openingLine:
      "You do not need to guess your future role; you need a clear path, milestones, and the right skill upgrades.",
    careerMatches: [
      "Product Designer",
      "UX Research Analyst",
      "AI Solutions Specialist",
    ],
    careerMilestones: [
      "Month 1: Build a portfolio project aligned with your strongest skill.",
      "Month 2: Complete one role-specific certification or course.",
      "Month 3: Run 3 mock interviews and apply to 10 targeted roles.",
    ],
    dailyMissions: [
      "Study one learning-path topic for 25 focused minutes.",
      "Update one portfolio bullet with measurable impact.",
      "Reach out to one mentor or peer in your target field.",
    ],
    learningPath: [
      "Week 1-2: Foundation refresh from your current education level.",
      "Week 3-6: Applied projects to strengthen practical role skills.",
      "Week 7-10: Interview prep, case practice, and networking sprints.",
      "Week 11-12: Job applications and portfolio polish.",
    ],
    skillGapAnalysis: [
      "Strength: Existing domain familiarity from your current skills.",
      "Gap: Advanced problem framing and role-specific tooling depth.",
      "Action: Add weekly project reps and measurable portfolio outcomes.",
    ],
    careerSimulator:
      "If you follow this plan for 90 days, you can transition from exploration to interview-ready candidate status with a focused portfolio.",
    careerRoadmap:
      "Phase 1 Discover -> Phase 2 Build -> Phase 3 Validate -> Phase 4 Apply",
    grounding: makeFallbackGrounding(profile),
    mode: "demo",
  };
}

function normalizeSource(source: unknown, index: number): InsightSource {
  if (typeof source === "string") {
    return {
      title: `Source ${index + 1}`,
      summary: source,
      citation: "Foundry IQ",
    };
  }

  if (source && typeof source === "object") {
    const record = source as Record<string, unknown>;
    const summary =
      typeof record.summary === "string"
        ? record.summary
        : typeof record.text === "string"
          ? record.text
          : typeof record.excerpt === "string"
            ? record.excerpt
            : JSON.stringify(source);

    return {
      title:
        typeof record.title === "string"
          ? record.title
          : typeof record.name === "string"
            ? record.name
            : `Source ${index + 1}`,
      summary,
      citation:
        typeof record.url === "string"
          ? record.url
          : typeof record.citation === "string"
            ? record.citation
            : "Foundry IQ",
    };
  }

  return {
    title: `Source ${index + 1}`,
    summary: "No structured source data was returned.",
    citation: "Foundry IQ",
  };
}

function extractSources(payload: unknown): InsightSource[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const rawSources = record.citations ?? record.sources ?? record.documents ?? record.results;

  if (Array.isArray(rawSources)) {
    return rawSources.slice(0, 3).map((source, index) => normalizeSource(source, index));
  }

  return [];
}

function extractSummary(payload: unknown, profile: CareerProfile, fromFoundry = false): CareerQuest {
  if (!payload || typeof payload !== "object") {
    return buildFallbackCareerQuest(profile);
  }

  const record = payload as Record<string, unknown>;
  const fallback = buildFallbackCareerQuest(profile);
  const title =
    typeof record.title === "string"
      ? record.title
      : typeof record.answer === "string"
        ? record.answer.slice(0, 70)
        : fallback.title;
  const logline =
    typeof record.logline === "string"
      ? record.logline
      : typeof record.summary === "string"
        ? record.summary
        : fallback.logline;
  const tagline =
    typeof record.tagline === "string"
      ? record.tagline
      : "Career guidance, grounded with context.";
  const openingLine =
    typeof record.openingLine === "string"
      ? record.openingLine
      : typeof record.opening === "string"
        ? record.opening
        : fallback.openingLine;

  const careerMatches = Array.isArray(record.careerMatches)
    ? record.careerMatches.filter((value): value is string => typeof value === "string")
    : Array.isArray(record.matches)
      ? record.matches.filter((value): value is string => typeof value === "string")
      : fallback.careerMatches;
  const careerMilestones = Array.isArray(record.careerMilestones)
    ? record.careerMilestones.filter((value): value is string => typeof value === "string")
    : Array.isArray(record.heroMoments)
      ? record.heroMoments.filter((value): value is string => typeof value === "string")
      : fallback.careerMilestones;
  const dailyMissions = Array.isArray(record.dailyMissions)
    ? record.dailyMissions.filter((value): value is string => typeof value === "string")
    : Array.isArray(record.missions)
      ? record.missions.filter((value): value is string => typeof value === "string")
      : fallback.dailyMissions;
  const learningPath = Array.isArray(record.learningPath)
    ? record.learningPath.filter((value): value is string => typeof value === "string")
    : Array.isArray(record.visualSystem)
      ? record.visualSystem.filter((value): value is string => typeof value === "string")
      : fallback.learningPath;
  const skillGapAnalysis = Array.isArray(record.skillGapAnalysis)
    ? record.skillGapAnalysis.filter((value): value is string => typeof value === "string")
    : Array.isArray(record.skillGaps)
      ? record.skillGaps.filter((value): value is string => typeof value === "string")
      : fallback.skillGapAnalysis;

  const careerSimulator =
    typeof record.careerSimulator === "string"
      ? record.careerSimulator
      : fallback.careerSimulator;

  const careerRoadmap =
    typeof record.careerRoadmap === "string"
      ? record.careerRoadmap
      : fallback.careerRoadmap;

  const grounding = extractSources(payload);
  const fallbackGrounding = fromFoundry
    ? makeFoundryGroundingFallback(profile)
    : makeFallbackGrounding(profile);

  return {
    title,
    logline,
    tagline,
    openingLine,
    careerMatches: careerMatches.length ? careerMatches.slice(0, 4) : fallback.careerMatches,
    careerMilestones: careerMilestones.length
      ? careerMilestones.slice(0, 4)
      : fallback.careerMilestones,
    dailyMissions: dailyMissions.length ? dailyMissions.slice(0, 4) : fallback.dailyMissions,
    learningPath: learningPath.length ? learningPath.slice(0, 4) : fallback.learningPath,
    skillGapAnalysis: skillGapAnalysis.length
      ? skillGapAnalysis.slice(0, 4)
      : fallback.skillGapAnalysis,
    careerSimulator,
    careerRoadmap,
    grounding: grounding.length ? grounding : fallbackGrounding,
    mode: fromFoundry ? "foundry" : "demo",
  };
}

async function fetchFoundryIq(profile: CareerProfile) {
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
      query: `Generate a career quest with matches, milestones, learning path, skill-gap analysis, simulator, and roadmap. Interests: ${profile.interests}. Skills: ${profile.skills}. Education: ${profile.education}. Goals: ${profile.goals}.`,
      context: {
        interests: profile.interests,
        skills: profile.skills,
        education: profile.education,
        goals: profile.goals,
      },
      topK: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Foundry IQ request failed with status ${response.status}`);
  }

  return response.json();
}

export async function buildCareerQuest(profile: CareerProfile): Promise<CareerQuest> {
  const trimmedProfile: CareerProfile = {
    interests: profile.interests.trim() || DEFAULT_INTERESTS,
    skills: profile.skills.trim() || "communication, collaboration, and digital tools",
    education: profile.education.trim() || "undergraduate level",
    goals: profile.goals.trim() || "transition into a growth career role",
  };

  try {
    const foundryPayload = await fetchFoundryIq(trimmedProfile);
    if (foundryPayload) {
      return extractSummary(foundryPayload, trimmedProfile, true);
    }
  } catch {
    // Fall back to local synthesis when Foundry IQ is unavailable.
  }

  return buildFallbackCareerQuest(trimmedProfile);
}
