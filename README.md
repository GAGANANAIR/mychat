# MyChat

A personal AI chat website — your own private "ChatGPT-style" interface, backed by [Groq's](https://groq.com) free API (fast inference on open models like Llama 3.3, no credit card required).

## Setup

```bash
git clone https://github.com/GAGANANAIR/mychat.git
cd mychat
npm install
cp .env.example .env
```

Edit `.env`:
1. Get a **free** API key at [console.groq.com/keys](https://console.groq.com/keys) (no credit card needed) and set `GROQ_API_KEY`
2. Optionally set `ACCESS_KEY` to any random string — this password-protects your chat so if you deploy it publicly, random people can't burn through your free quota just by finding the URL

Then run:
```bash
npm start
```

Open `http://localhost:3000`.

## Deploying for free

Works the same as this project's sibling apps — deploy to [Render](https://render.com) free tier:
1. New Web Service → connect this repo
2. Build command: `npm install`
3. Start command: `npm start`
4. Add `GROQ_API_KEY` and (optionally) `ACCESS_KEY` under Environment

## How it works

- The frontend never sees your Groq API key — it only talks to your own `/api/chat` endpoint, which holds the real key server-side and proxies the request
- Conversation history is kept in the browser's memory only (not saved anywhere) — refreshing the page starts a new conversation
- If `ACCESS_KEY` is set, the frontend prompts for it once and stores it in `sessionStorage` for that browser tab only

## Changing the model

Groq offers several free models. Set `GROQ_MODEL` in `.env` to any of:
- `llama-3.3-70b-versatile` (best quality, default)
- `llama-3.1-8b-instant` (fastest)
- `mixtral-8x7b-32768` (long context)

See [Groq's model list](https://console.groq.com/docs/models) for the current full set.

## Author

**Gagan A Nair**
- [Website](https://gagagananair.netlify.app/)
