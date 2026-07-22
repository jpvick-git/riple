# AGENTS.md

## Cursor Cloud specific instructions

Ripple is a single Next.js 14 (App Router, TypeScript) web app — no monorepo, no database, no test suite. Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`) and setup is in `README.md`.

### Services
- Only one service: the Next.js server (`npm run dev`, serves on port 3000). Server-side API routes under `app/api/generate/*` call the OpenAI Responses API. There is no DB; caching is in-memory (`lib/cache.ts`, resets on restart) and per-browser `sessionStorage`.

### Non-obvious notes
- Core scenario generation requires a real `OPENAI_API_KEY` in `.env.local` (gitignored). Without it the UI still loads and the flow works, but every `/api/generate*` route returns HTTP 500 with the message "OPENAI_API_KEY is missing…", surfaced in the UI as a "Something went wrong" dialog with Retry. So a running server + home page is NOT proof of end-to-end generation — you need the key to demonstrate the core feature.
- Copy `.env.local.example` → `.env.local`. Keep `OPENAI_WEB_SEARCH=false` (default) to avoid the OpenAI `web_search` tool; the sources route then returns an empty array and the app still works. The env template targets `gpt-5-mini`.
- Restart the dev server after editing `.env.local` — env changes are not hot-reloaded.
- The seed scenarios in `data/` (`titanic.ts`, `prototypeScenario.ts`) are NOT wired into any page/route, so they cannot be used to preview a full scenario without calling OpenAI.
- No automated tests exist (no Jest/Vitest/Playwright). "Testing" means running the app and generating a scenario manually. Lint is `npm run lint`.
- `ecosystem.config.cjs`, `deploy/`, and `DEPLOY.md` are production-only (PM2 on port 3001, Nginx, Certbot); not needed for local dev.
