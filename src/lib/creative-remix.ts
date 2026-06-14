export type CreativeBrief = {
  prompt: string;
  audience: string;
  format: string;
  mood: string;
  medium: string;
};

export type InsightSource = {
  title: string;
  summary: string;
  citation: string;
};

export type CreativeRemix = {
  title: string;
  logline: string;
  tagline: string;
  openingLine: string;
  heroMoments: string[];
  visualSystem: string[];
  grounding: InsightSource[];
  mode: "foundry" | "demo";
};

const DEFAULT_PROMPT = "A creative app for brainstorming a new experience.";

function sentenceCase(text: string) {
  const trimmed = text.trim();
  return trimmed.length ? trimmed[0].toUpperCase() + trimmed.slice(1) : trimmed;
}

function deriveTitle(prompt: string, format: string) {
  const fragment = prompt
    .split(/[,.;:!?]/)[0]
    .split(/\s+/)
    .slice(0, 4)
    .join(" ");

  return `${sentenceCase(fragment || DEFAULT_PROMPT)} ${format ? `for ${format}` : ""}`
    .replace(/\s+/g, " ")
    .trim();
}

function makeFallbackGrounding(brief: CreativeBrief): InsightSource[] {
  return [
    {
      title: "Brief DNA",
      summary: `Your prompt centers on ${brief.prompt || DEFAULT_PROMPT.toLowerCase()}. The remix keeps that core idea intact while changing the medium.`,
      citation: "Local synthesis",
    },
    {
      title: "Audience Lens",
      summary: `This version is tuned for ${brief.audience || "a general creative audience"} so the output feels immediately usable.`,
      citation: "Local synthesis",
    },
    {
      title: "Tone Compass",
      summary: `The ${brief.mood || "playful"} mood is translated into pacing, color, and language choices.`,
      citation: "Local synthesis",
    },
  ];
}

export function buildFallbackRemix(brief: CreativeBrief): CreativeRemix {
  const title = deriveTitle(brief.prompt, brief.format);

  return {
    title,
    logline: `A ${brief.mood || "playful"} ${brief.format || "experience"} shaped for ${brief.audience || "creative users"} and grounded in ${brief.medium || "a flexible visual medium"}.`,
    tagline: "Turn a brief into a living concept board.",
    openingLine:
      "You do not need a blank page anymore; you need the right constraints and one vivid starting image.",
    heroMoments: [
      "A prompt-to-concept engine that expands one idea into a memorable package.",
      "A grounding panel that keeps the output anchored to cited or synthesized context.",
      "A remix stage that translates strategy into mood, scene, and structure.",
    ],
    visualSystem: [
      `Primary medium: ${brief.medium || "mixed media"}`,
      `Mood language: ${brief.mood || "luminous"}`,
      `Audience focus: ${brief.audience || "general creative"}`,
      `Format target: ${brief.format || "interactive concept"}`,
    ],
    grounding: makeFallbackGrounding(brief),
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

function extractSummary(payload: unknown, brief: CreativeBrief): CreativeRemix {
  if (!payload || typeof payload !== "object") {
    return buildFallbackRemix(brief);
  }

  const record = payload as Record<string, unknown>;
  const fallback = buildFallbackRemix(brief);
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
      : "Grounded ideas, remixed with style.";
  const openingLine =
    typeof record.openingLine === "string"
      ? record.openingLine
      : typeof record.opening === "string"
        ? record.opening
        : fallback.openingLine;

  const heroMoments = Array.isArray(record.heroMoments)
    ? record.heroMoments.filter((value): value is string => typeof value === "string")
    : fallback.heroMoments;
  const visualSystem = Array.isArray(record.visualSystem)
    ? record.visualSystem.filter((value): value is string => typeof value === "string")
    : fallback.visualSystem;
  const grounding = extractSources(payload);

  return {
    title,
    logline,
    tagline,
    openingLine,
    heroMoments: heroMoments.length ? heroMoments.slice(0, 3) : fallback.heroMoments,
    visualSystem: visualSystem.length ? visualSystem.slice(0, 4) : fallback.visualSystem,
    grounding: grounding.length ? grounding : makeFallbackGrounding(brief),
    mode: grounding.length ? "foundry" : "demo",
  };
}

async function fetchFoundryIq(brief: CreativeBrief) {
  const endpoint = process.env.FOUNDRY_IQ_ENDPOINT?.replace(/\/$/, "");
  const apiKey = process.env.FOUNDRY_IQ_API_KEY;
  const workspace = process.env.FOUNDRY_IQ_WORKSPACE;

  if (!endpoint) {
    return null;
  }

  const response = await fetch(`${endpoint}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(workspace ? { "x-foundry-workspace": workspace } : {}),
    },
    body: JSON.stringify({
      query: brief.prompt,
      context: {
        audience: brief.audience,
        format: brief.format,
        mood: brief.mood,
        medium: brief.medium,
      },
      topK: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Foundry IQ request failed with status ${response.status}`);
  }

  return response.json();
}

export async function buildCreativeRemix(brief: CreativeBrief): Promise<CreativeRemix> {
  const trimmedBrief: CreativeBrief = {
    prompt: brief.prompt.trim() || DEFAULT_PROMPT,
    audience: brief.audience.trim() || "creative explorers",
    format: brief.format.trim() || "concept deck",
    mood: brief.mood.trim() || "luminous",
    medium: brief.medium.trim() || "editorial mixed media",
  };

  try {
    const foundryPayload = await fetchFoundryIq(trimmedBrief);
    if (foundryPayload) {
      return extractSummary(foundryPayload, trimmedBrief);
    }
  } catch {
    // Fall back to local synthesis when Foundry IQ is unavailable.
  }

  return buildFallbackRemix(trimmedBrief);
}
