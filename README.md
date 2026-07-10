# PS 25061 SIH Hackathon — Sangha / Monastery360

A digital window into Sikkim's monasteries: a Next.js tourism site with an interactive monastery
map, a digital heritage archive, and **Bodhi** — an AI guide chatbot backed by hybrid
LOCAL/LIVE retrieval (ChromaDB knowledge base + Gemini Google Search grounding).

## Project structure

```
.
├── api.py                      # FastAPI server (Bodhi's /chat endpoint)
├── chatbot.py                  # BodhiChatbot: LOCAL/LIVE routing, sessions, citations
├── vector_store.py             # ChromaDB heritage vector store (multilingual embeddings)
├── ingest.py                   # Chunks data/*.txt and loads them into ChromaDB
├── data/                       # Source content: monasteries, culture, travel info
├── requirements.txt            # Python dependencies
├── .env.example                # Template for required backend env vars
├── render.yaml                 # Render deploy config for the backend
└── sih-website/                # Next.js frontend
    ├── app/                    # App router: landing page, /archive route
    ├── components/             # Hero, Nav, MonasteryMap, DigitalArchive, BodhiChatbot, ...
    └── .env.example            # Template for required frontend env vars
```

## Backend setup

```bash
python -m venv .venv
source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in GEMINI_API_KEY
python ingest.py                # populate the ChromaDB knowledge base (required once)
uvicorn api:app --reload
```

- Health check: `GET http://127.0.0.1:8000/`
- Interactive docs: `http://127.0.0.1:8000/docs`
- Chat: `POST http://127.0.0.1:8000/chat` — `{ "message": "...", "session_id": "..." }`, returns `{ "reply": "...", "sources": [...] }`

Re-run `python ingest.py` any time you add/edit a `.txt` file in `data/` — it clears and
rebuilds the ChromaDB collection from everything currently in that folder.

## Frontend setup

```bash
cd sih-website
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_URL defaults to http://localhost:8000
npm run dev
```

Runs on `http://localhost:3000` and expects the backend at the URL in `NEXT_PUBLIC_API_URL`.

## Deploying

- **Frontend → Vercel.** Standard Next.js deploy, no extra config. Set `NEXT_PUBLIC_API_URL`
  in the Vercel project settings to the deployed backend URL.
- **Backend → Render.** `render.yaml` at the repo root defines the service (see it for the
  exact build/start commands). Vercel isn't viable for the backend: its dependencies
  (`torch`, `sentence-transformers`, `chromadb`) exceed Vercel's serverless function size
  limit, and ChromaDB needs persistent disk that serverless functions don't provide. On
  Render, set `GEMINI_API_KEY` and `ALLOWED_ORIGINS` (comma-separated, e.g. your Vercel URL)
  in the dashboard.

## Known limitations

- The Digital Archive (`/archive`) is currently a UI demo over hardcoded sample data — it's
  not wired to a real OCR pipeline or storage backend yet.
- Bodhi's Gemini API key is subject to the free-tier daily quota (20 requests/day) unless
  billing is enabled on the underlying Google Cloud project.

## 👥 Team Details
- **Team Name:** SyntaxSinners
- **Team Leader:** @radhika-c06

**Team Members:**
- MEMBER_1 – 2024UEC2628 – @radhika-c06
- MEMBER_2 – 2024UEC2633 – @vidushi2124
- MEMBER_3 – 2024UEC2616 – @palaksachdeva
- MEMBER_4 – 2024UIC4050 – @anshjayara
- MEMBER_5 – 2024UIC3558 – @malhotrakavyansh
- MEMBER_6 – 2024UIC3648 – @aryanbansal2124

## 🔗 Project Links
- **SIH Presentation:** [Final SIH Presentation](https://www.canva.com/design/DAGzZCwMxgg/NK2IH18_7jLhASktqqoNdA/edit?utm_content=DAGzZCwMxgg&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
- **Video Demonstration:** [Watch Video](https://drive.google.com/file/d/1v0Z1X5Di5uAIsCHSRzhH9bxAIYVt7O5P/view?usp=sharing)
- **Source Code:** [GitHub Repository](https://github.com/radhika-c06/SIH_2025_SyntaxSinners_25061)
