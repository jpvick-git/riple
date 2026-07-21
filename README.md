# Riple

Riple is an AI-powered “what if?” explorer. Enter one changed event and the app researches the real-world context, then generates a structured speculative cause-and-effect timeline.

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

## Production

See [DEPLOY.md](./DEPLOY.md) for hosting on a DigitalOcean droplet at `riple.me`.
