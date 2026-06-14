# Atlas Remix Studio

Atlas Remix Studio is a creative app for Battle #1 (Creative Apps with GitHub Copilot). It transforms a short idea into a grounded, presentation-ready concept board with title, logline, hero moments, visual system, and source-aware grounding.

## Why This Fits The Challenge

### 1) GitHub Copilot Usage (Required)
- Copilot assisted with app scaffolding, UI composition, and refactors.
- Copilot Chat was used for API hardening, fallback design, and documentation structure.
- Copilot was used to iterate quickly on prompt-to-output UX and submission checklists.

### 2) Microsoft IQ Integration (Required)
- Microsoft IQ layer used: Foundry IQ.
- Integration path is implemented in [src/lib/creative-remix.ts](src/lib/creative-remix.ts).
- API route that calls the remix engine is in [src/app/api/remix/route.ts](src/app/api/remix/route.ts).
- If Foundry IQ is unavailable, the app gracefully falls back to local synthesis so demos remain reliable.

### 3) Creative Application (Required)
- Novel concept: one brief becomes a multi-lane creative concept board.
- Useful output for writers, designers, and game creators.
- Intentional visual style and responsive UX for desktop and mobile.

## Core Features
- Prompt-to-concept generation with structured creative output.
- Grounding panel with source/citation display.
- Foundry IQ-backed mode when env config is present.
- Demo mode fallback when Foundry IQ is not configured.
- Curated starter prompts for story, design, and puzzle directions.

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

## Local Validation

```bash
npm run lint
npm run build
```

## Architecture Snapshot
- Page entry: [src/app/page.tsx](src/app/page.tsx)
- Main UI: [src/components/creative-studio.tsx](src/components/creative-studio.tsx)
- API endpoint: [src/app/api/remix/route.ts](src/app/api/remix/route.ts)
- Remix + Foundry adapter: [src/lib/creative-remix.ts](src/lib/creative-remix.ts)

## Security Checklist
- Never commit `.env.local`.
- Do not commit API keys, tokens, or credentials.
- Use demo data only.
- Scan commits before submission.

## Readiness Status (June 14, 2026)

### Verified Complete
- Creative application is implemented and running as Atlas Remix Studio.
- GitHub Copilot usage is documented in this README.
- Microsoft IQ integration path (Foundry IQ) is implemented with graceful fallback.
- Local validation passed:
	- `npm run lint`
	- `npm run build`

### Final Submission Steps
- Fill and finalize Copilot contribution evidence: [docs/COPILOT-EVIDENCE.md](docs/COPILOT-EVIDENCE.md).
- Execute final pre-submit checks: [docs/SUBMISSION-CHECKLIST.md](docs/SUBMISSION-CHECKLIST.md).
- Capture one Foundry-mode screenshot with grounding/citation visible.
- Confirm no secrets are committed before push.

## Team Same-Day Plan
Detailed hour-by-hour execution guide: [docs/TODAY-TEAM-PLAN.md](docs/TODAY-TEAM-PLAN.md)

## Demo Script (Suggested)
1. Enter a creative prompt and target audience.
2. Generate a remix and show title/logline/hero moments.
3. Highlight grounding and citation section.
4. Explain Foundry IQ mode vs demo fallback mode.
5. Close with creative value and extensibility.
