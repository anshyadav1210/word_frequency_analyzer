# Word Frequency Analyzer
**IIT Mandi Mini Project** — Built with Next.js + Claude AI

## What it does
- Upload any **PDF, DOCX, or TXT** file
- See the most frequent words with a bar chart
- **AI powered by Claude (hidden API key — users never see it):**
  - Summarize the document
  - Explain any word in context
  - Ask any question about the document

---

## Setup (one time only)

### 1. Install Node.js
Download from https://nodejs.org (choose LTS version)

### 2. Get an Anthropic API key
- Go to https://console.anthropic.com
- Sign up → API Keys → Create key → Copy it

### 3. Add your API key
Open `.env.local` and replace `your_api_key_here`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

### 4. Install and run
```bash
npm install
npm run dev
```
Open http://localhost:3000

---

## Deploy online free (Vercel)
1. Push to GitHub
2. Go to vercel.com → import repo
3. Add env variable: ANTHROPIC_API_KEY = your key
4. Deploy → share the link with anyone

## Key point
API key is server-side only. Users never see it.
