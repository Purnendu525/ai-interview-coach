# AI Interview Coach

Type a technical topic, pick Easy / Medium / Hard, and an AI interviewer asks you one question
at a time — following up when you're half-right, moving on when you're wrong, and ending the
interview on its own when it has seen enough. Then you get a scored report: strengths,
weaknesses, topics to revise, a verdict, and Pass or Fail.

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** Python + FastAPI
- **AI provider:** Groq (`llama-3.3-70b-versatile`)
- **Database:** none — the frontend holds the conversation and sends it back on every call

```
ai-interview-coach/
├── backend/          FastAPI app (interviewer logic, report generation, API)
└── frontend/          Next.js app (start / interview / report screens)
```

## 1. Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [Python](https://www.python.org/) 3.10 or later
- A free Groq API key from [console.groq.com/keys](https://console.groq.com/keys)

## 2. Run it locally

**Backend:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then paste your GROQ_API_KEY into .env
uvicorn main:app --reload --port 8000
```

The backend is now at `http://localhost:8000`. Visit `http://localhost:8000/api/health` — you
should see `{"status":"ok"}`. Interactive API docs are at `http://localhost:8000/docs`.

**Frontend** (in a second terminal):

```bash
cd frontend
npm install
cp .env.local.example .env.local  # defaults already point at localhost:8000
npm run dev
```

Open `http://localhost:3000`. Type a topic, pick a difficulty, and start an interview.

## 3. How it works

- `POST /api/start` — give a topic + difficulty, get the interviewer's opening question.
- `POST /api/answer` — send the conversation so far plus your answer, get the interviewer's
  next message and whether the interview is over.
- `POST /api/report` — send the finished conversation, get the structured score report.
- `GET /api/health` — health check.

The interviewer and report generator both force the model to reply with a single JSON object
(Groq's JSON mode), so the backend never has to guess where a question ends — see
`backend/interviewer.py` and `backend/report_generator.py`.

## 4. Deploying it

Only do this once everything works locally. Backend → [Render](https://render.com) (free),
frontend → [Vercel](https://vercel.com) (free). You'll need a GitHub account and free Render
and Vercel accounts (sign in to both with GitHub).

### Push to GitHub

This project already comes as a git repo — unzipping it gives you a `main` branch with one
commit, `"Initial commit: AI Interview Coach"`, and `.env` files were never tracked. You only
need to connect it to GitHub and push.

Create an empty **public** repo on GitHub named `ai-interview-coach` (no README, no
`.gitignore` — this project already has one), then:

```bash
cd ai-interview-coach
git remote add origin https://github.com/<your-username>/ai-interview-coach.git
git push -u origin main
```

### Deploy the backend on Render

1. render.com → **New → Web Service** → connect GitHub → pick `ai-interview-coach`.
2. Fill in:
   - **Name:** `ai-interview-coach-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
   - **Environment variable:** `GROQ_API_KEY` = your Groq key
3. **Create Web Service.** First deploy takes 2–3 minutes. Open the URL Render gives you (e.g.
   `https://ai-interview-coach-backend.onrender.com/api/health`) and confirm you see
   `{"status":"ok"}`. Copy the base URL (without `/api/health`).

The backend already reads its port from `$PORT` (see the Start Command above) and reads
extra allowed CORS origins from the `ALLOWED_ORIGINS` environment variable — nothing in the
code assumes it's running on your laptop.

### Deploy the frontend on Vercel

1. vercel.com → **Add New → Project** → import `ai-interview-coach`. Vercel detects Next.js
   automatically.
2. Fill in:
   - **Root Directory:** `frontend`
   - **Build settings:** leave the defaults
   - **Environment variable:** `NEXT_PUBLIC_API_URL` = the Render URL you copied (no trailing
     slash)
3. **Deploy.** About a minute. Open the live URL, start an interview, answer one question. If
   the interviewer replies, you're deployed.

### Allow the deployed frontend to call the backend

Back in Render, add or update the `ALLOWED_ORIGINS` environment variable on the backend
service to your Vercel URL, e.g.:

```
ALLOWED_ORIGINS=https://ai-interview-coach.vercel.app
```

Save — Render will redeploy automatically. (`localhost:3000` is always allowed, so local
development keeps working either way.)

## 5. If the live app doesn't work

| Symptom | Fix |
|---|---|
| Nothing happens for 30–60s on first use | Normal — Render's free tier sleeps after 15 minutes idle; the first request wakes it. Wait a minute and try again. |
| Works locally, fails live, browser console says CORS | Add your Vercel URL to `ALLOWED_ORIGINS` on the Render backend (see above), save, wait for redeploy. |
| Frontend loads but every call fails | `NEXT_PUBLIC_API_URL` is missing or wrong on Vercel. Fix it in Project Settings → Environment Variables, then Redeploy. |
| Build fails on Render or Vercel | Root Directory is wrong — Render must be `backend`, Vercel must be `frontend`. |
| Backend returns a 500 about a missing key | `GROQ_API_KEY` isn't set. Add it in `backend/.env` locally, or as an environment variable on Render. |
