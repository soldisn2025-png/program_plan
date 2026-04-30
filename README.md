# ABA Training Plan Generator — MVP

## Live App

- **App:** https://program-plan-app.onrender.com
- **API:** https://program-plan-api.onrender.com/api/health

> First load after inactivity may take ~30 seconds (free tier spins down when idle).



---

## Manual Setup (without Docker)

### 1. Database (PostgreSQL)
```bash
createdb aba_app
psql aba_app < server/src/db/schema.sql
psql aba_app < server/src/db/seeds.sql
psql aba_app < server/src/db/vbmapp_seeds.sql
psql aba_app < server/src/db/vbmapp_program_templates.sql
psql aba_app < server/src/db/vbmapp_program_templates_overrides.sql
psql aba_app < server/src/db/vbmapp_milestone_templates.sql
psql aba_app < server/src/db/import_audit_log.sql
```

### 2. Backend
```bash
cd server
cp .env.example .env          # edit DATABASE_URL, JWT_SECRET
npm install
npm run dev                   # http://localhost:5000
```

The server now performs an idempotent sync of the official VB-MAPP milestone set on startup (Levels 1-3, 170 milestones total). To run that sync manually:

```bash
cd server
npm run sync:vbmapp
```

### 3. Frontend
```bash
cd client
npm install
npm run dev                   # http://localhost:5173
```

---

## User Roles
| Role | Access |
|------|--------|
| **Parent** | Child profiles, view plans, log home data |
| **RBT** | Create plans, log session trials, view progress |
| **BCBA** | All of the above + create custom goals |

---

## Key Features (MVP)

### Program Plan Template Output
Every goal generates a full structured program plan including:
- Data Collection method
- Prerequisite Skills
- Material / Set-up Required
- SD (Discriminative Stimulus)
- Correct Responses
- Incorrect Responses
- Prompting Hierarchy (Most to Least / Least to Most)
- Error Correction procedure
- Transfer Procedure
- Reinforcement Schedule
- Generalization Plan
- Maintenance Plan

Access via: **Plans → Plan Detail → "View Program Plan"** on any goal.

### Goal Library
30 evidence-based goals across 6 domains:
- Verbal Behavior (6 goals)
- Daily Living (5 goals)
- Social Skills (5 goals)
- Academic (5 goals)
- Behavior Reduction (4 goals)
- Imitation (4 goals — generalized + object + peer + fine motor)

### Data Collection
- Trial-by-trial logging with +/−/NR buttons
- Prompt level tracking per trial
- Auto-aggregation into data points
- Automatic mastery detection (80% over 3 sessions)
- Progress charts per goal

### PDF Export
Click **🖨 Print / PDF** on any Program Plan page → browser print dialog → Save as PDF.

---

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS + Recharts
- **Backend:** Node.js + Express + JWT auth
- **Database:** PostgreSQL
- **Containerization:** Docker Compose
