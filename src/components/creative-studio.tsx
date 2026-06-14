"use client";

import { useEffect, useMemo, useState } from "react";
import type { CareerQuest } from "@/lib/creative-remix";

type ProfileState = {
  interests: string;
  skills: string;
  education: string;
  goals: string;
};

type ProgressState = {
  xp: number;
  streak: number;
  lastActiveDate: string;
  completedMissionIds: string[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type UserProfileState = {
  fullName: string;
  currentRole: string;
  experienceLevel: string;
  preferredIndustry: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

type InterviewQuestion = {
  question: string;
  focus: string;
  sampleStrongPoint: string;
};

const XP_PER_MISSION = 60;
const XP_PER_LEVEL = 240;
const STORAGE_KEY = "ai-career-quest-progress-v1";
const USER_PROFILE_STORAGE_KEY = "ai-career-quest-user-profile-v1";

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

const initialProgress: ProgressState = {
  xp: 0,
  streak: 0,
  lastActiveDate: "",
  completedMissionIds: [],
};

const initialUserProfile: UserProfileState = {
  fullName: "",
  currentRole: "",
  experienceLevel: "Early-career",
  preferredIndustry: "",
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function CreativeStudio() {
  const [profile, setProfile] = useState<ProfileState>(initialProfile);
  const [quest, setQuest] = useState<CareerQuest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState<ProgressState>(() => {
    if (typeof window === "undefined") {
      return initialProgress;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return initialProgress;
      }

      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        xp: typeof parsed.xp === "number" ? parsed.xp : 0,
        streak: typeof parsed.streak === "number" ? parsed.streak : 0,
        lastActiveDate: typeof parsed.lastActiveDate === "string" ? parsed.lastActiveDate : "",
        completedMissionIds: Array.isArray(parsed.completedMissionIds)
          ? parsed.completedMissionIds.filter((value): value is string => typeof value === "string")
          : [],
      };
    } catch {
      return initialProgress;
    }
  });
  const [userProfile, setUserProfile] = useState<UserProfileState>(() => {
    if (typeof window === "undefined") {
      return initialUserProfile;
    }

    try {
      const raw = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (!raw) {
        return initialUserProfile;
      }

      const parsed = JSON.parse(raw) as Partial<UserProfileState>;
      return {
        fullName: typeof parsed.fullName === "string" ? parsed.fullName : "",
        currentRole: typeof parsed.currentRole === "string" ? parsed.currentRole : "",
        experienceLevel:
          typeof parsed.experienceLevel === "string" ? parsed.experienceLevel : "Early-career",
        preferredIndustry:
          typeof parsed.preferredIndustry === "string" ? parsed.preferredIndustry : "",
      };
    } catch {
      return initialUserProfile;
    }
  });

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachMessages, setCoachMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I am your AI Career Coach. Ask me for interview plans, weekly schedules, or project ideas based on your career quest.",
    },
  ]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
  }, [userProfile]);

  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  const xpInLevel = progress.xp % XP_PER_LEVEL;
  const levelProgress = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  const dailyMissions = useMemo(() => {
    if (!quest) {
      return [] as Array<{ id: string; title: string }>;
    }

    const today = getTodayKey();
    return quest.dailyMissions.map((title, index) => ({
      id: `${today}-mission-${index + 1}`,
      title,
    }));
  }, [quest]);

  const completedTodayCount = dailyMissions.filter((mission) =>
    progress.completedMissionIds.includes(mission.id),
  ).length;

  const quizScore = quizQuestions.reduce((score, question, index) => {
    return quizAnswers[index] === question.answerIndex ? score + 1 : score;
  }, 0);

  async function generateQuest(nextProfile = profile) {
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

      setQuest(payload.remix);
      setCoachMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "New quest generated. Ask me to break this into a daily plan, interview prep, or skill sprint checklist.",
        },
      ]);
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

  function toggleMission(missionId: string) {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    setProgress((current) => {
      const sameDay = current.lastActiveDate === today;
      const baseCompleted = sameDay ? [...current.completedMissionIds] : [];
      const alreadyCompleted = baseCompleted.includes(missionId);

      let nextCompleted = baseCompleted;
      let nextXp = current.xp;
      let nextStreak = current.streak;
      let nextLastActive = current.lastActiveDate;

      if (alreadyCompleted) {
        nextCompleted = baseCompleted.filter((id) => id !== missionId);
        nextXp = Math.max(0, current.xp - XP_PER_MISSION);
      } else {
        nextCompleted = [...baseCompleted, missionId];
        nextXp = current.xp + XP_PER_MISSION;

        if (current.lastActiveDate === today) {
          nextStreak = current.streak;
        } else if (current.lastActiveDate === yesterday) {
          nextStreak = current.streak + 1;
        } else {
          nextStreak = 1;
        }

        nextLastActive = today;
      }

      return {
        xp: nextXp,
        streak: nextStreak,
        lastActiveDate: nextLastActive,
        completedMissionIds: nextCompleted,
      };
    });
  }

  async function sendCoachMessage() {
    const content = coachInput.trim();
    if (!content) {
      return;
    }

    const nextUserMessage: ChatMessage = { role: "user", content };
    const nextMessages = [...coachMessages, nextUserMessage];

    setCoachMessages(nextMessages);
    setCoachInput("");
    setCoachLoading(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          quest: quest
            ? {
                careerMatches: quest.careerMatches,
                careerMilestones: quest.careerMilestones,
                skillGapAnalysis: quest.skillGapAnalysis,
              }
            : undefined,
          messages: nextMessages,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { reply?: string; error?: string }
        | null;

      if (!response.ok || !payload?.reply) {
        throw new Error(payload?.error || "Coach response unavailable.");
      }

      setCoachMessages((current) => [...current, { role: "assistant", content: payload.reply! }]);
    } catch {
      setCoachMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I could not reach the coach backend right now. Try again in a moment or ask for a simpler next-step plan.",
        },
      ]);
    } finally {
      setCoachLoading(false);
    }
  }

  async function generateQuiz() {
    setQuizLoading(true);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          quest: quest
            ? {
                careerMatches: quest.careerMatches,
                skillGapAnalysis: quest.skillGapAnalysis,
              }
            : undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { questions?: QuizQuestion[] }
        | null;

      if (!response.ok || !payload?.questions?.length) {
        throw new Error("Quiz generation failed.");
      }

      setQuizQuestions(payload.questions);
      setQuizAnswers({});
      setQuizSubmitted(false);
    } catch {
      setQuizQuestions([]);
      setQuizSubmitted(false);
    } finally {
      setQuizLoading(false);
    }
  }

  async function generateInterviewQuestions() {
    setInterviewLoading(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          quest: quest
            ? {
                careerMatches: quest.careerMatches,
                skillGapAnalysis: quest.skillGapAnalysis,
              }
            : undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { questions?: InterviewQuestion[] }
        | null;

      if (!response.ok || !payload?.questions?.length) {
        throw new Error("Interview question generation failed.");
      }

      setInterviewQuestions(payload.questions);
    } catch {
      setInterviewQuestions([]);
    } finally {
      setInterviewLoading(false);
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
                  Gamified progression
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-200/80">
                  AI Career Quest
                </p>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
                  Build your future with missions, streaks, and a live AI coach.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                  Generate a grounded career quest, complete daily missions, and level up with
                  progress tracking. Ask the AI coach for weekly plans, portfolio ideas, and
                  interview preparation tuned to your profile.
                </p>
              </div>
            </div>

            <div className="grid w-full max-w-sm gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <StatCard label="Level" value={`Lv ${level}`} />
              <StatCard label="Streak" value={`${progress.streak} day`} />
              <StatCard
                label="Missions"
                value={quest ? `${completedTodayCount}/${dailyMissions.length}` : "0/0"}
              />
              <StatCard
                label="Quiz score"
                value={quizSubmitted ? `${quizScore}/${quizQuestions.length}` : "Not taken"}
              />
            </div>
          </div>
        </header>

        <section className="glass-panel rounded-[2rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">User profile</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Your career identity card</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="Full name"
              value={userProfile.fullName}
              onChange={(value) => setUserProfile((current) => ({ ...current, fullName: value }))}
              placeholder="Enter your name"
            />
            <Field
              label="Current role"
              value={userProfile.currentRole}
              onChange={(value) =>
                setUserProfile((current) => ({ ...current, currentRole: value }))
              }
              placeholder="Student, Developer, Designer..."
            />
            <Field
              label="Experience level"
              value={userProfile.experienceLevel}
              onChange={(value) =>
                setUserProfile((current) => ({ ...current, experienceLevel: value }))
              }
              placeholder="Early-career, Mid-level, Senior"
            />
            <Field
              label="Preferred industry"
              value={userProfile.preferredIndustry}
              onChange={(value) =>
                setUserProfile((current) => ({ ...current, preferredIndustry: value }))
              }
              placeholder="FinTech, HealthTech, Gaming..."
            />
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Progress dashboard</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <DashboardCard label="Total XP" value={String(progress.xp)} />
            <DashboardCard label="XP this level" value={`${xpInLevel}/${XP_PER_LEVEL}`} />
            <DashboardCard label="Current streak" value={`${progress.streak} day`} />
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>Level {level} progress</span>
              <span>{levelProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Career input</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Share interests, skills, education, and goals.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => generateQuest()}
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
                    void generateQuest({ ...preset.profile });
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
                onClick={() => generateQuest()}
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
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Career output</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Your quest board, ready to act on.
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
                {quest?.mode === "foundry" ? "Foundry IQ" : "Demo synthesis"}
              </div>
            </div>

            {quest ? (
              <div className="space-y-5">
                <article className="rounded-[1.75rem] border border-cyan-300/15 bg-slate-950/30 p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Career roadmap</p>
                  <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{quest.title}</h3>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{quest.logline}</p>
                  <p className="mt-4 text-sm italic leading-6 text-amber-100/90">
                    &ldquo;{quest.tagline}&rdquo;
                  </p>
                </article>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card title="Career matches" tone="cyan">
                    {quest.careerMatches.map((match) => (
                      <li key={match}>{match}</li>
                    ))}
                  </Card>
                  <Card title="Career milestones" tone="amber">
                    {quest.careerMilestones.map((milestone) => (
                      <li key={milestone}>{milestone}</li>
                    ))}
                  </Card>
                </div>

                <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">Daily career missions</p>
                  <div className="mt-4 space-y-3">
                    {dailyMissions.map((mission) => {
                      const checked = progress.completedMissionIds.includes(mission.id);
                      return (
                        <label
                          key={mission.id}
                          className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-3"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMission(mission.id)}
                            className="mt-1 h-4 w-4 accent-cyan-300"
                          />
                          <span className={checked ? "text-slate-400 line-through" : "text-slate-200"}>
                            {mission.title}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </article>

                <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">Quest-based learning path</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                    {quest.learningPath.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">Skill-gap analysis</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                    {quest.skillGapAnalysis.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">Career simulator</p>
                  <p className="mt-3 text-lg leading-8 text-white">{quest.careerSimulator}</p>
                </article>

                <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">Grounding</p>
                  <div className="mt-4 space-y-3">
                    {quest.grounding.map((source) => (
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

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Career quiz</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Skill check challenge</h2>
              </div>
              <button
                type="button"
                onClick={() => generateQuiz()}
                disabled={quizLoading}
                className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {quizLoading ? "Generating..." : "Generate Quiz"}
              </button>
            </div>

            {quizQuestions.length ? (
              <div className="space-y-4">
                {quizQuestions.map((question, questionIndex) => (
                  <article
                    key={`${question.question}-${questionIndex}`}
                    className="rounded-xl border border-white/10 bg-slate-950/30 p-4"
                  >
                    <p className="text-sm font-semibold text-white">{question.question}</p>
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const selected = quizAnswers[questionIndex] === optionIndex;
                        return (
                          <label
                            key={`${option}-${optionIndex}`}
                            className="flex cursor-pointer items-start gap-2 text-sm text-slate-200"
                          >
                            <input
                              type="radio"
                              name={`quiz-question-${questionIndex}`}
                              checked={selected}
                              onChange={() =>
                                setQuizAnswers((current) => ({
                                  ...current,
                                  [questionIndex]: optionIndex,
                                }))
                              }
                              className="mt-1 h-4 w-4 accent-cyan-300"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                    {quizSubmitted ? (
                      <p className="mt-3 text-xs text-cyan-100/90">{question.explanation}</p>
                    ) : null}
                  </article>
                ))}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuizSubmitted(true)}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50"
                  >
                    Submit quiz
                  </button>
                  {quizSubmitted ? (
                    <p className="text-sm text-cyan-100">
                      Score: {quizScore}/{quizQuestions.length}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300">
                Generate a quiz to practice role readiness and close knowledge gaps.
              </p>
            )}
          </section>

          <section className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
                  AI interview questions
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Mock interview pack</h2>
              </div>
              <button
                type="button"
                onClick={() => generateInterviewQuestions()}
                disabled={interviewLoading}
                className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {interviewLoading ? "Generating..." : "Generate Questions"}
              </button>
            </div>

            {interviewQuestions.length ? (
              <div className="space-y-3">
                {interviewQuestions.map((item, index) => (
                  <article
                    key={`${item.question}-${index}`}
                    className="rounded-xl border border-white/10 bg-slate-950/30 p-4"
                  >
                    <p className="text-sm font-semibold text-white">{item.question}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.25em] text-amber-200/80">
                      Focus: {item.focus}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">{item.sampleStrongPoint}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-300">
                Generate personalized interview questions based on your current quest and goals.
              </p>
            )}
          </section>
        </div>

        <section className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">AI Career Coach</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Chat with your quest mentor</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
              Backend: /api/coach
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="max-h-72 space-y-3 overflow-auto pr-1">
              {coachMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "assistant"
                      ? "rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-50"
                      : "rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100"
                  }
                >
                  {message.content}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={coachInput}
                onChange={(event) => setCoachInput(event.target.value)}
                placeholder="Ask: Create my 7-day interview prep plan"
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
              />
              <button
                type="button"
                onClick={() => sendCoachMessage()}
                disabled={coachLoading}
                className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {coachLoading ? "Thinking..." : "Ask Coach"}
              </button>
            </div>
          </div>
        </section>
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

function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
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
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Ready when you are</p>
        <h3 className="text-3xl font-semibold text-white">
          {isLoading ? "The quest engine is working." : "Your first career quest board will appear here."}
        </h3>
        <p className="text-sm leading-6 text-slate-300">
          Generate your quest to unlock daily missions, streak tracking, and AI coaching.
        </p>
      </div>
    </div>
  );
}
