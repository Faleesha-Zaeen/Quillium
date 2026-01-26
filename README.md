Quillium · Transform Documents Into Knowledge
=============================================

Quillium turns dense PDF study materials into interactive quizzes, flashcards, progress dashboards, and upcoming "Quillium Shorts" snackable scripts. A FastAPI backend extracts knowledge while a cinematic Next.js interface walks learners through uploads, reviews, and AI-assisted study loops.

Architecture Snapshot
---------------------
- **Frontend**: Next.js App Router + React Server Components, TypeScript, Tailwind CSS, Framer Motion, lucide-react, custom cyberpunk UI kit.
- **Backend**: FastAPI + Uvicorn, PyMuPDF for PDF parsing, Gemini + OpenAI APIs for content + audio, python-dotenv for config.
- **Shared assets**: `/audio` for generated narration, `frontend/public/shorts` for preview reels.

Repository Layout
-----------------
```
backend/
  app/
    main.py              # FastAPI entry + router
    mcq_generator.py     # Gemini-powered MCQ & flashcard builders
    pdf_processor.py     # PyMuPDF extraction helpers
    translation.py       # Translator bootstrap logic
  requirements.txt
  run.py                 # Convenience launcher (wraps uvicorn)
frontend/
  app/                   # Next.js pages, layouts, feature sections
  lib/                   # API client, hooks, shared utils
  public/                # Static media (short previews, icons, etc.)
  package.json
README.md
```

Tech Stack
----------
| Layer    | Technologies |
|----------|--------------|
| Frontend | Next.js 16 (Turbopack), React 19 RC APIs, TypeScript, Tailwind CSS, PostCSS, Framer Motion, lucide-react |
| Backend  | FastAPI, Uvicorn, PyMuPDF, google-generativeai (Gemini), OpenAI Python SDK, python-dotenv |
| Tooling  | npm, Node.js ≥ 18, Python ≥ 3.11, virtualenv |

Prerequisites
-------------
- Node.js ≥ 18.17 (ships with npm)
- Python ≥ 3.11 with `pip`
- Optional: `virtualenv` for isolated backend deps

Environment Variables
---------------------
Create `backend/.env` (or export manually) with:
```
GEMINI_API_KEY=your_google_generative_ai_key
OPENAI_API_KEY=sk-...
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ALLOWED_ORIGINS=http://localhost:3000
```

Optional frontend config (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
The frontend defaults to `http://localhost:8000` if the variable is omitted.

Installation
------------
1. **Clone** the repo and create the backend `.env`.
2. **Install backend deps** inside a virtual environment.
3. **Install frontend deps** with npm.

### Backend setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
```

### Frontend setup
```powershell
cd frontend
npm install
```

Running the Project
-------------------
Run the backend first, then the frontend in another terminal.

### 1. Start FastAPI backend
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python run.py
```
`run.py` loads env vars, prints key status (Gemini/OpenAI), and starts Uvicorn with reload on `http://localhost:8000`.

Manual alternative:
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Next.js frontend
```powershell
cd frontend
npm run dev
```
This boots Next.js on `http://localhost:3000`. (Turbopack may warn about `serverActions`/`api` keys or multiple lockfiles; the warnings are safe to ignore unless you want to tidy config.)

### 3. Open the app
Visit `http://localhost:3000` and start uploading PDFs. The backend REST API lives at `http://localhost:8000` (e.g., `GET /health`, `POST /process-pdf`).

Feature Walkthrough
-------------------
1. Upload a PDF via the hero section.
2. Choose a target language (50+ options). Gemini generates MCQs directly in that language.
3. Review quizzes and matching flashcards built from the generated MCQs.
4. Track quiz accuracy on the progress board and preview upcoming Quillium Shorts scripts + TTS playback.

Key API Endpoints
-----------------
| Method | Endpoint                 | Description |
|--------|--------------------------|-------------|
| GET    | `/`                      | Basic status/version |
| GET    | `/health`                | Health + translator flag |
| POST   | `/process-pdf`           | Upload PDF → MCQs + flashcards |
| POST   | `/generate-short-script` | Topic → short-form script |
| POST   | `/generate-short-audio`  | Script → narrated audio via OpenAI TTS |

Troubleshooting
---------------
- **CORS errors**: ensure `ALLOWED_ORIGINS` matches your frontend origin.
- **Always-English MCQs**: verify `GEMINI_API_KEY` is valid and not rate-limited.
- **Frontend warning about workspace root**: Next.js detects multiple `package-lock.json` files; keep only the project-level file or set `turbopack.root` in `next.config.js`.
- **Pydantic warning (`model_cache_exists`)**: harmless; silence by setting `model_config['protected_namespaces'] = ()` on the affected model if desired.

Developer Notes
---------------
- Keep backend & frontend terminals open for auto-reload.
- Update `backend/requirements.txt` after adding new Python packages: `pip freeze > requirements.txt`.
- Run `npm run lint` (if configured) before committing frontend changes.



