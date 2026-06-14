Atlas Remix Studio is a creative app starter that turns a short prompt into a concept board, pitch language, and a grounding layer powered by Microsoft Foundry IQ when configured.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## What It Does

- Turns a creative brief into a themed concept package.
- Shows a grounded output panel with sources from Foundry IQ when available.
- Falls back to local synthesis so the app still works without secrets.

## Foundry IQ Setup

Create a `.env.local` file with these values when you have a Foundry IQ endpoint:

```bash
FOUNDRY_IQ_ENDPOINT=https://your-foundry-iq-endpoint
FOUNDRY_IQ_API_KEY=your-api-key
FOUNDRY_IQ_WORKSPACE=optional-workspace-id
```

If those variables are not set, the app uses the local remix engine.

## Copilot Build Notes

GitHub Copilot was used to scaffold the app structure, draft the remix UI, and shape the Foundry IQ adapter and fallback logic.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load expressive Google fonts for the UI.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
