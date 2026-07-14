# J-AGENTS — Job discovery + tailoring agent

Twice-daily agent that finds SDET / QA Automation / SDE-1 jobs matching Bipin's profile, scores them with Claude, drafts a tailored cover letter, and delivers a digest with 1-click apply links.

## Flow

```
GitHub Actions cron (09:00 & 19:00 IST)
        │
        ▼
  1. Discover  →  Adzuna API (aggregates Indeed + other boards, India)
  2. Score     →  Claude scores fit + writes strengths/gaps + drafts cover letter
  3. Digest    →  digests/YYYY-MM-DD.md committed to repo
                  + optional email via Resend
  4. Autofill  →  autofill/apply-autofill.user.js regenerated from your profile
  5. You       →  Open digest, read 🟢 top matches, copy cover letter, click Apply
                  (autofill script fills the boilerplate fields for you)
```

**Why hybrid?** Full-auto scraping+submitting to LinkedIn/Naukri/etc. triggers bot detection and can get accounts banned or blocked by CAPTCHAs, and most boards' ToS prohibit it outright. Semi-auto (agent finds + drafts + prefills, you review and tap Apply) gets nearly all the speed benefit with zero account risk and better response rates on tailored applications.

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

You should see a new file `digests/<timestamp>.md`. Open it — this is what you'll get twice daily.

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

Cron fires at 09:00 and 19:00 IST. The workflow commits `digests/*.md`, updated `data/applications.json`, and the regenerated `autofill/apply-autofill.user.js` back to the repo automatically.

## Application autofill (no auto-submit)

Every run regenerates `autofill/apply-autofill.user.js` — a userscript built from your `profile.ts` + `preferences.ts`. It **never submits anything**; it just prefills boilerplate fields (name, email, phone, LinkedIn/GitHub, current company/title, years of experience, current/expected CTC, notice period, education) on whatever application page you're on, via a small "⚡ Autofill" button it adds to the page. You still review every field and click Submit yourself.

**Install once (Chrome/Edge/Brave):**
1. Install [Tampermonkey](https://www.tampermonkey.net/) from the Chrome Web Store — free on Chrome (only Safari requires a paid App Store version)
2. Since Chrome 138, Manifest V3 requires an extra one-time toggle for userscript managers to actually run scripts: go to `chrome://extensions` → find Tampermonkey → **Details** → enable **"Allow User Scripts"** (or enable Developer Mode at the top of that page instead, which has the same effect)
3. Open `https://raw.githubusercontent.com/bipinyct/J-AGENTS/main/autofill/apply-autofill.user.js` — Tampermonkey will offer to install it
4. Because the script has `@updateURL`/`@downloadURL` headers, Tampermonkey will periodically pull the latest version as your profile changes — no manual reinstall needed

(Firefox doesn't have the MV3 restriction above, so step 2 isn't needed there.)

Fields it can't know per-job (like "why do you want to work here") are left blank — use the tailored cover letter already in the digest for those.

## What lives where

| Path | Purpose |
| --- | --- |
| `src/config/profile.ts` | Your resume as structured data |
| `src/config/preferences.ts` | Titles, CTC, keyword filters |
| `src/discovery/adzuna.ts` | Adzuna API client |
| `src/matching/score.ts` | Claude scoring + cover letter |
| `src/notifications/digest.ts` | Markdown + email digest |
| `src/tools/autofillScript.ts` | Generates the autofill userscript |
| `src/storage/db.ts` | JSON state (dedupe seen jobs) |
| `data/applications.json` | Every job ever seen |
| `digests/*.md` | Every run's output — this is your inbox |
| `autofill/apply-autofill.user.js` | Generated userscript — install once in Tampermonkey |

## Tuning

- **`preferences.runtime.minFitScoreToApply`** — jobs above this show in the 🎯 top matches section (default 65)
- **`preferences.runtime.minFitScoreToSurface`** — jobs above this appear in the digest at all (default 45)
- **`preferences.targetTitles`** — first 6 are queried each run (Adzuna quota-friendly)
- **`preferences.noticePeriod`** — fill this in so the autofill script can answer "notice period" questions

## Ongoing

- Each run costs: 1 Adzuna API call per keyword (~6) + 1 Claude call per unique job (~10-30). Well within free tiers.
- Adjust `preferences.ts`/`profile.ts` and push — the next cron picks up the change, including a refreshed autofill script.
- Applied to a job manually? Set its status in `data/applications.json` to prevent it appearing again (or just ignore — the dedupe by `id` keeps repeats out).
