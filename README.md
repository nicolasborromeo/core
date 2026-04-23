# Coretone Landing Pages

This repo hosts two validation landing pages:

- `/` — Core Sampler
- `/scoresync` — ScoreSync

## Stack

- Vite
- React
- TypeScript

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment variables

Create a `.env` file or set these in Render:

- `VITE_CORE_SAMPLER_WAITLIST_URL`
- `VITE_SCORESYNC_WAITLIST_URL`

## Deployment

Configured for Render static hosting via `render.yaml`.
