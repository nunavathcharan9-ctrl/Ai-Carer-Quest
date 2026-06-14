# AI Career Quest

AI Career Quest is a Battle #1 creative app built with GitHub Copilot and Next.js. It helps users turn personal profile inputs into a practical, quest-style career plan.

## Project Category

- Career Guidance + Gamified Learning

## User Input

- Interests
- Skills
- Education
- Goals

## Output

- Career matches
- Career roadmap
- Career milestones
- Skill-gap analysis
- Career simulator
- Quest-based learning path

## Why This Fits The Challenge

### 1) GitHub Copilot Usage (Required)

- Copilot accelerated UI composition, refactors, and API hardening.
- Copilot Chat assisted with fallback strategy and parser robustness.
- Copilot support is documented in [docs/COPILOT-EVIDENCE.md](docs/COPILOT-EVIDENCE.md).

### 2) Microsoft IQ Integration (Required)

- Microsoft IQ layer used: Foundry IQ.
- Integration is implemented in [src/lib/creative-remix.ts](src/lib/creative-remix.ts).
- API route integration is implemented in [src/app/api/remix/route.ts](src/app/api/remix/route.ts).
- If Foundry IQ is unavailable, the app falls back to local synthesis for reliable demos.

### 3) Creative Application (Required)

- Novel concept: career planning presented as an interactive quest board.
- Useful output for students, job switchers, and growth-focused professionals.
- Responsive UI for both desktop and mobile demo flows.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Foundry IQ Setup

Create `.env.local`:

```bash
FOUNDRY_IQ_ENDPOINT=https://your-foundry-iq-endpoint
FOUNDRY_IQ_API_KEY=your-api-key
FOUNDRY_IQ_WORKSPACE=optional-workspace-id
```

If these are missing, the app automatically uses demo synthesis mode.

## Validation

```bash
npm run lint
npm run build
```

## Architecture Snapshot

- Page entry: [src/app/page.tsx](src/app/page.tsx)
- Main UI: [src/components/creative-studio.tsx](src/components/creative-studio.tsx)
- API endpoint: [src/app/api/remix/route.ts](src/app/api/remix/route.ts)
- Quest engine + Foundry adapter: [src/lib/creative-remix.ts](src/lib/creative-remix.ts)

## Security Notes

- Never commit `.env.local`.
- Do not commit API keys, tokens, or credentials.
- Use demo/sample data only.
