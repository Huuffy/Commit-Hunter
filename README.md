<div align="center">

# 🎯 Commit Hunter

### Real-time GitHub commit tracking & AI analysis for hackathons

![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=A855F7&center=true&vCenter=true&width=600&lines=Track+every+commit.+Score+every+line.;AI-powered+hackathon+judging.;Built+for+COHERENCE+%2726.)

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://js-ecosystem-showcase.vercel.app/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)

</div>

---

## ✨ What is Commit Hunter?

**Commit Hunter** is a full-stack hackathon monitoring platform built for [COHERENCE '26](https://mlsc-vcet.tech). It automatically pulls GitHub commits from every participating team, runs them through a local AI model, and scores them — giving organizers a live dashboard to see who's actually shipping code vs. who's copy-pasting boilerplate.

<div align="center">

![demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd3dWZ3aGo2NTN3NW9xNGp2OHhkNXVxbGR0aWVzeTd3M2hkMzlnYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qgQUggAC3Pfv687qPC/giphy.gif)

</div>

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔍 **Live Commit Tracking** | Polls GitHub API every 30s for all registered teams |
| 🤖 **AI Scoring** | Ollama (local) scores each commit A–J → 1–20 points |
| 📊 **Team Analytics** | Hourly activity charts, top files, contributors, churn rate |
| 📄 **Printable Reports** | Per-team PDF-ready report with full commit history |
| ⚡ **Crash Recovery** | Server restart auto-fetches missed commits |
| 🗄️ **Static Deploy** | Export DB → JSON, host frontend on Vercel — no backend needed |

---

## 🏗️ Architecture

```
GitHub API
    │
    ▼
collector.py ──► SQLite DB ──► queue_manager.py ──► Ollama AI
                    │                                     │
                    └──────── team_scores ◄───────────────┘
                                   │
                              FastAPI /api/v1
                                   │
                         React Dashboard (Vercel)
```

**Two apps, one repo:**
- `backend/` — Python FastAPI (port 8000), SQLite + optional MongoDB
- `frontend/` — React 19 + Vite, deployed to Vercel

---

## 🤖 AI Scoring System

Each commit is analyzed by a local [Ollama](https://ollama.ai) model (`qwen2.5-coder:3b`) and assigned a category:

| Category | Description | Score |
|---|---|---|
| A | Empty / merge commit | 1 |
| B | Config / README only | 4 |
| C | Default scaffold | 5 |
| D | Simple component / CSS | 7 |
| E | DB model / utility | 9 |
| F | API route with logic | 11 |
| G | Auth / middleware | 13 |
| H | Real-time / file processing | 15 |
| I | Multi-service integration | 17 |
| J | Exceptional engineering | 19 |



---

## 🛠️ Local Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Create backend/.env
GITHUB_TOKEN=your_token_here
OLLAMA_MODEL=qwen2.5-coder:3b

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Docker (backend only)

```bash
cd backend
docker compose up --build
```

---

## ☁️ Vercel Deploy (Static, No Backend)

The frontend can be deployed fully statically — data is pre-exported from the SQLite DB into JSON files.

**Step 1 — Export DB to JSON:**
```bash
python export_db_to_json.py
```

**Step 2 — Commit & push:**
```bash
git add frontend/public/data/
git commit -m "Updated DB records"
git push
```

**Step 3 — Vercel settings:**
| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | *(none needed)* |



---

## 📁 Project Structure

```
commit-hunter/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # collectors.py, history.py
│   │   ├── models/             # db_models.py, api_models.py
│   │   ├── services/           # collector, ai_analysis, scheduler, queue_manager
│   │   └── db/                 # SQLite session, MongoDB
│   ├── src/                    # GitHub client, commit processor, team mapper
│   ├── config/                 # repositories.yaml, teams.yaml
│   └── data/                   # SQLite DB, event_state.json
├── frontend/
│   ├── src/
│   │   ├── api/                # commitAnalyzerClient.js (static adapter)
│   │   ├── components/commit-analyzer/  # Dashboard, TeamReport
│   │   └── pages/              # AdminDashboard, CommitAnalyzer, CommitReport
│   └── public/data/            # Pre-exported JSON (teams, analytics)
└── export_db_to_json.py        # DB → static JSON export script
```

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GITHUB_TOKEN` | ✅ | — | GitHub API token |
| `OLLAMA_MODEL` | ❌ | `qwen2.5-coder:3b` | Local AI model |
| `GROQ_API_KEY` | ❌ | — | Groq fallback AI |
| `MONGO_URL` | ❌ | — | MongoDB Atlas (analytics mirror) |
| `DATABASE_URL` | ❌ | `sqlite:///./commit_collector.db` | DB path |

---

<div align="center">

Built with 💜 for **COHERENCE '26**

![footer](https://capsule-render.vercel.app/api?type=waving&color=A855F7&height=100&section=footer)

</div>
