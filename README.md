# J-AGENTS — Job discovery + tailoring agent

Twice-daily agent that finds SDET / QA Automation / SDE-1 jobs matching Bipin's profile, scores them with Claude, drafts a tailored cover letter, and delivers a digest with 1-click apply links.

## Flow

```
GitHub Actions cron (09:00 & 19:00 IST)
        │
        ▼
  1. Discover  →  Adzuna API (aggregates Indeed + other boards, India)
  2. Score     →  Claude scores fit + writes strengths/gaps + drafts cover letter
  3. Digest    →  digests/YYYY-MM-DD.md + .xlsx committed to repo
                  + optional email via Resend
  4. You       →  Open the .xlsx for scanning/copy-paste, or the .md for reading,
                  read 🟢 top matches, copy cover letter, click Apply
```

**Why hybrid?** Full-auto scraping+submitting to LinkedIn/Naukri/etc. triggers bot detection and can get accounts banned or blocked by CAPTCHAs, and most boards' ToS prohibit it outright. Semi-auto (agent finds + drafts, you review and tap Apply) gets nearly all the speed benefit with zero account risk and better response rates on tailored applications.

## One-time setup

### 1. Install
```bash
npm install
cp .env.example .env
```

### 2. Get the required API keys

**Anthropic** — https://console.anthropic.com/settings/keys → paste into `ANTHROPIC_API_KEY`

**Adzuna** — https://developer.adzuna.com/signup
- Free tier: 250 calls/month, no credit card
- Copy your `app_id` / `app_key` → paste into `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`

### 3. (Optional) Email digest via Resend

If you skip this, you still get the full digest as a Markdown file in `digests/` — just open it on GitHub after each run.

- Sign up at https://resend.com (free tier = 100 emails/day)
- Create an API key → paste into `RESEND_API_KEY`
- Sender: use `onboarding@resend.dev` for now (works with no domain verification)

### 4. Local test run
```bash
npm run run:agent
```

You should see two new files: `digests/<timestamp>.md` and `digests/<timestamp>.xlsx` — this is what you'll get twice daily.

### 5. Deploy to GitHub

Push to a GitHub repo, then in Settings → Secrets and variables → Actions:

**Secrets:**
- `ANTHROPIC_API_KEY`
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `RESEND_API_KEY` (if using email)

**Variables:**
- `DIGEST_TO_EMAIL` = `bipinkainbox@gmail.com`
- `DIGEST_FROM_EMAIL` = `onboarding@resend.dev`
- `AI_MODEL` = `claude-sonnet-4-5` (optional, defaults to this)

Cron fires at 09:00 and 19:00 IST. The workflow commits `digests/*.md`, `digests/*.xlsx`, and updated `data/applications.json` back to the repo automatically.

## Excel digest

Alongside the Markdown digest, every run also writes `digests/<timestamp>.xlsx` — one row per job, with dedicated columns (Fit Score, Title, Company, Location, Board, Posted, Why It Fits, Strengths, Gaps, Cover Letter, Apply Link), sorted by fit score descending. The Fit Score column is color-coded (green ≥80, yellow ≥65, orange ≥45, gray below), long text columns wrap instead of truncating, and the Apply Link column is a clickable hyperlink. Built for scanning many jobs at once and copy-pasting cells — open it in Excel, Google Sheets, or Numbers.

## What lives where

| Path | Purpose |
| --- | --- |
| `src/config/profile.ts` | Your resume as structured data |
| `src/config/preferences.ts` | Titles, CTC, keyword filters |
| `src/discovery/adzuna.ts` | Adzuna API client |
| `src/matching/score.ts` | Claude scoring + cover letter |
| `src/notifications/digest.ts` | Markdown + email digest |
| `src/notifications/excelDigest.ts` | Formatted .xlsx digest |
| `src/storage/db.ts` | JSON state (dedupe seen jobs) |
| `data/applications.json` | Every job ever seen |
| `digests/*.md` / `digests/*.xlsx` | Every run's output — this is your inbox |

## Tuning

- **`preferences.runtime.minFitScoreToApply`** — jobs above this show in the 🎯 top matches section (default 65)
- **`preferences.runtime.minFitScoreToSurface`** — jobs above this appear in the digest at all (default 45)
- **`preferences.targetTitles`** — first 6 are queried each run (Adzuna quota-friendly)

## Ongoing

- Each run costs: 1 Adzuna API call per keyword (~6) + 1 Claude call per unique job (~10-30). Well within free tiers.
- Adjust `preferences.ts`/`profile.ts` and push — the next cron picks up the change.
- Applied to a job manually? Set its status in `data/applications.json` to prevent it appearing again (or just ignore — the dedupe by `id` keeps repeats out).
