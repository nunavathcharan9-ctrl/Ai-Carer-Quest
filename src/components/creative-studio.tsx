"use client";

import { useState } from "react";
import type { CareerQuest } from "@/lib/creative-remix";

type ProfileState = {
  interests: string;
  skills: string;
  education: string;
  goals: string;
};

const starterPrompts = [
  {
    label: "Design to Product",
    profile: {
      interests: "UI design, creativity, and user psychology",
      skills: "Figma, visual design, and basic prototyping",
      education: "Bachelors in Computer Science",
      goals: "Transition into Product Designer role in 6 months",
    },
  },
  {
    label: "Support to AI Ops",
    profile: {
      interests: "automation, operations, and AI tooling",
      skills: "customer support, SQL basics, troubleshooting",
      education: "Engineering diploma",
      goals: "Move into AI operations specialist track",
    },
  },
  {
    label: "Writer to Narrative Design",
    profile: {
      interests: "games, storytelling, and world building",
      skills: "creative writing, dialogue scripting",
      education: "BA in Literature",
      goals: "Become a game narrative designer",
    },
  },
] as const;

const initialProfile: ProfileState = {
  interests: starterPrompts[0].profile.interests,
  skills: starterPrompts[0].profile.skills,
  education: starterPrompts[0].profile.education,
  goals: starterPrompts[0].profile.goals,
};

export function CreativeStudio() {
  const [profile, setProfile] = useState<ProfileState>(initialProfile);
  const [remix, setRemix] = useState<CareerQuest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateRemix(nextProfile = profile) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/remix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextProfile),
      });

      const payload = (await response.json().catch(() => null)) as
        | { remix?: CareerQuest; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || `Request failed with status ${response.status}`);
      }

      if (!payload?.remix) {
        throw new Error("The career quest engine returned an empty response.");
      }

      setRemix(payload.remix);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The career quest engine could not complete the request.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-50">
      <div className="absolute inset-0 grid-mesh opacity-35" />
      <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute right-[-5rem] top-24 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="absolute bottom-[-7rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-5">
              <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-cyan-200/90">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1">
                  Career Guidance
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Foundry IQ ready
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  GitHub Copilot build
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-200/80">
                  AI Career Quest
                </p>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
                  Turn your profile into a guided career roadmap.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                  AI Career Quest helps learners and professionals discover role matches,
                  close skill gaps, and build step-by-step growth plans. If Foundry IQ is
                  configured, guidance is grounded with enterprise context. Otherwise it
                  falls back to polished local synthesis so the app still runs today.
                </p>
              </div>
            </div>

            <div className="grid w-full max-w-sm gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <StatCard label="Output lanes" value="Matches, roadmap, simulator" />
              <StatCard label="IQ layer" value="Foundry IQ + fallback" />
              <StatCard label="Time to demo" value="Today" />
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                  Career input
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Share interests, skills, education, and goals.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => generateRemix()}
                disabled={isLoading}
                className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Generating..." : "Quest now"}
              </button>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {starterPrompts.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setProfile({ ...preset.profile });
                    void generateRemix({ ...preset.profile });
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <Field
                label="Interests"
                value={profile.interests}
                onChange={(value) => setProfile((current) => ({ ...current, interests: value }))}
                rows={5}
                textarea
                placeholder="What topics or industries excite you?"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Skills"
                  value={profile.skills}
                  onChange={(value) => setProfile((current) => ({ ...current, skills: value }))}
                  placeholder="Current strengths and tools"
                />
                <Field
                  label="Education"
                  value={profile.education}
                  onChange={(value) => setProfile((current) => ({ ...current, education: value }))}
                  placeholder="Degree, certification, or background"
                />
                <Field
                  label="Goals"
                  value={profile.goals}
                  onChange={(value) => setProfile((current) => ({ ...current, goals: value }))}
                  placeholder="Target role and timeline"
                  textarea
                  rows={3}
                />
              </div>

              <button
                type="button"
                onClick={() => generateRemix()}
                disabled={isLoading}
                className="w-full rounded-[1.25rem] bg-white px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Building your quest..." : "Generate Career Quest"}
              </button>

              {error ? (
                <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </p>
              ) : null}

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/75">
                  Setup note
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Add your Foundry IQ connection details in environment variables to use
                  live grounding. Without that config, the app keeps working with local
                  synthesis, so your career demo is still shippable today.
                </p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
                  Career output
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Your quest board, ready to act on.
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
                {remix?.mode === "foundry" ? "Foundry IQ" : "Demo synthesis"}
              </div>
            </div>

            {remix ? (
              <div className="space-y-5">
                <article className="rounded-[1.75rem] border border-cyan-300/15 bg-slate-950/30 p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                    Career roadmap
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                    {remix.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    {remix.logline}
                  </p>
                  <p className="mt-4 text-sm italic leading-6 text-amber-100/90">
                    “{remix.tagline}”
                  </p>
                </article>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card title="Career matches" tone="cyan">
                    {remix.careerMatches.map((match) => (
                      <li key={match}>{match}</li>
                    ))}
                  </Card>
                  <Card title="Career milestones" tone="amber">
                    {remix.careerMilestones.map((moment) => (
                      <li key={moment}>{moment}</li>
                    ))}
                  </Card>
                </div>

                <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
                    Quest-based learning path
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                    {remix.learningPath.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
                    Skill-gap analysis
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                    {remix.skillGapAnalysis.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
                    Career simulator
                  </p>
                  <p className="mt-3 text-lg leading-8 text-white">{remix.careerSimulator}</p>
                </article>

                <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
                    Grounding
                  </p>
                  <div className="mt-4 space-y-3">
                    {remix.grounding.map((source) => (
                      <div
                        key={`${source.title}-${source.citation}`}
                        className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h4 className="font-medium text-white">{source.title}</h4>
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-cyan-100/80">
                            {source.citation}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{source.summary}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            ) : (
              <EmptyState isLoading={isLoading} />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
        />
      )}
    </label>
  );
}

function Card({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "cyan" | "amber";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "cyan"
      ? "border-cyan-300/15 bg-cyan-300/5"
      : "border-amber-300/15 bg-amber-300/5";

  return (
    <article className={`rounded-[1.5rem] border p-5 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.35em] text-slate-300/75">{title}</p>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">{children}</ul>
    </article>
  );
}

function EmptyState({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="flex min-h-[36rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/25 p-8 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
          Ready when you are
        </p>
        <h3 className="text-3xl font-semibold text-white">
          {isLoading ? "The quest engine is working." : "Your first career quest board will appear here."}
        </h3>
        <p className="text-sm leading-6 text-slate-300">
          Submit your profile on the left to generate career matches, milestones,
          a learning path, and a grounded roadmap.
        </p>
      </div>
    </div>
  );
}
