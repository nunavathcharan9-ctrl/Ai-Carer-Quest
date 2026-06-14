# Submission Checklist (Battle #1)

Use this as your final pre-submit verification list.

## Core Requirements

- [x] Creative application implemented (AI Career Quest)
- [x] GitHub Copilot usage described
- [x] Microsoft IQ integration path implemented (Foundry IQ adapter)
- [x] Fallback behavior defined when IQ service is unavailable

## Technical Validation

- [x] Run `npm run lint` and confirm no errors
- [x] Run `npm run build` and confirm successful production build
- [x] Test local run with `npm run dev`
- [x] Verify mobile layout (narrow viewport)
- [x] Verify desktop layout (wide viewport)

## Microsoft IQ Evidence

- [ ] Configure `.env.local` with Foundry IQ values
- [ ] Run one request in Foundry mode and confirm output mode is `Foundry IQ`
- [ ] Capture one screenshot showing grounding/citations
- [ ] Record service endpoint used (without secrets)

## Copilot Evidence

- [x] Add at least 3 concrete examples of Copilot impact in docs/COPILOT-EVIDENCE.md
- [x] Include one debugging or refactor example from Copilot Chat
- [x] Include one prompt/suggestion that materially changed implementation

## Security Review

- [x] Confirm `.env.local` is in `.gitignore`
- [x] Confirm no secrets in repository files
- [x] Confirm no customer/PII or confidential data
- [x] Confirm sample/demo data only

## Submission Assets

- [x] README up to date with architecture + run steps
- [ ] Demo script rehearsed (3-5 minutes)
- [x] Screenshots prepared for submission
- [x] Final commit message documents readiness
