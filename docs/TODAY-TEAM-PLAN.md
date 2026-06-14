# Today Team Execution Plan (Battle #1)

## Goal
Ship a polished, demo-ready creative app submission in one day: Atlas Remix Studio.

## Team Roles
- Product + Demo Owner: final story, live demo flow, judging narrative.
- Frontend Owner: UI polish, responsiveness, loading/error states.
- AI/Backend Owner: Foundry IQ setup, route hardening, fallback quality.
- QA + Docs Owner: validation, README evidence, submission package.

## Timeline (One-Day Sprint)

### 1. Hour 1: Scope Lock + Setup
- Confirm app concept and judging narrative in 3 sentences.
- Pull latest code and run `npm install`, `npm run lint`, `npm run build`.
- Verify environment strategy: with and without Foundry IQ secrets.
- Decide demo prompt set (3 curated presets).

### 2. Hours 2-3: Core Product Completion
- Frontend owner finalizes interaction details and mobile behavior.
- Backend owner confirms API reliability and fallback behavior.
- Product owner reviews generated output quality and edits copy.
- QA owner captures before/after screenshots for submission.

### 3. Hour 4: Microsoft IQ Proof
- Configure `FOUNDRY_IQ_ENDPOINT` and `FOUNDRY_IQ_API_KEY` (if available).
- Run one grounded demo request and verify source/citation output.
- Capture evidence screenshot or log snippet for README.
- If service is unavailable, confirm graceful fallback and document it.

### 4. Hour 5: Copilot Evidence + Documentation
- Record where Copilot helped (UI scaffolding, logic, refactors, docs).
- Update README with requirement mapping and architecture notes.
- Add run steps and clear local setup instructions.
- Add security checklist review (no secrets committed).

### 5. Hour 6: Dry Run + Submission Package
- Rehearse a 3-5 minute demo script twice.
- Run final checks: `npm run lint` and `npm run build`.
- Verify `.env.local` is ignored and no credentials are in repo.
- Tag release or final commit and submit.

## Demo Script (3-5 Minutes)
1. Problem: creators lose momentum at the blank-page stage.
2. Solution: Atlas Remix Studio turns one brief into a pitch-ready concept board.
3. Live run: enter prompt -> generate -> show hero moments, visual system, grounding.
4. IQ value: highlight Foundry IQ grounded mode and citations.
5. Reliability: show fallback mode still produces quality output without secrets.
6. Close: explain why this is useful for writers, designers, and game creators.

## Definition of Done
- Build passes (`npm run build`).
- Lint passes (`npm run lint`).
- App works on desktop and mobile.
- Foundry IQ integration path documented and tested (or fallback documented).
- README includes Copilot usage + requirements mapping + setup.
- Repo has no secrets or sensitive data.
