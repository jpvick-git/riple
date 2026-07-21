# Ripple

Ripple is an AI-powered “what if?” explorer. Enter one changed event and the app researches the real-world context, then generates a structured speculative cause-and-effect timeline.

## Setup

1. Install Node.js 20 or newer.
2. Open this folder in a terminal.
3. Install dependencies:

```bash
npm install
```

4. Copy the environment template:

```bash
copy .env.local.example .env.local
```

On macOS or Linux, use:

```bash
cp .env.local.example .env.local
```

5. Open `.env.local` and replace the placeholder with your OpenAI API key:

```env
OPENAI_API_KEY=your_actual_key_here
OPENAI_MODEL=gpt-5-mini
```

6. Start the app:

```bash
npm run dev
```

7. Open `http://localhost:3000`.

## What now works

- Any valid what-if prompt is sent to a server-only API route.
- Real companies, people, products, and historical events can be researched with web search.
- The AI returns a structured scenario containing historical context, assumptions, a point of divergence, and 5–8 linked timeline events.
- Responses are validated before display.
- Loading and error states explain what is happening.
- The API key remains on the server and is never exposed to the browser.

## Current limitation

Generated scenarios are stored in browser session storage. Refreshing the page works, but opening the generated URL in a different browser or device will not. Database persistence, user accounts, branching, and permanent share links are later phases.
