# PrepMate AI 🚀

> AI-powered interview preparation platform — with LLM evaluation pipelines, Dockerized deployment, and automated test coverage.

PrepMate AI is a full-stack application that leverages **Google Gemini** and **OpenAI** to deliver personalized technical interview coaching. Beyond interview prep, the codebase serves as a real-world substrate for **LLM evaluation and SWE dataset construction** — aligning with current AI research needs.

[![Python Tests](https://img.shields.io/badge/tests-pytest-blue)](./tests/)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker)](./Dockerfile)
[![LLM](https://img.shields.io/badge/LLM-Gemini%20%7C%20OpenAI-orange)](./server/services/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## ✨ Features

- **🤖 AI Interviewer** — Realistic technical & behavioral interview sessions via Gemini 1.5 Flash
- **📄 Resume Parsing** — Upload resume; AI tailors questions to your specific experience
- **💻 Integrated Code Editor** — Monaco Editor (same engine as VS Code) with real-time evaluation
- **📈 LLM Response Evaluation** — Structured scoring of AI-generated code against test cases
- **🧪 Verifiable SWE Tasks** — Auto-constructed tasks from public repo histories for LLM training datasets
- **🔐 Secure Auth** — Email/Password + Google OAuth 2.0
- **🌓 Dark/Light Mode** — Fully responsive modern UI

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React.js + Vite | UI framework & fast build tooling |
| Monaco Editor | In-browser code editor |
| Vanilla CSS | Responsive, modern styling |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Data persistence |
| JWT + BcryptJS | Auth & session security |
| Helmet + Rate Limiter | API hardening |

### AI & LLM Integration
| Tool | Purpose |
|---|---|
| Google Gemini 1.5 Flash | Interview question generation & feedback |
| OpenAI API | Code evaluation & explanation |
| Multer | Resume file upload handling |

### DevOps & Testing
| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Containerized multi-service deployment |
| pytest + pytest-asyncio | Python LLM evaluation test suite |
| GitHub Actions (CI) | Automated test runs on push |

---

## 🧠 LLM Evaluation Pipeline

PrepMate AI includes a Python-based evaluation layer for testing LLM performance on realistic software engineering tasks — directly applicable to LLM training dataset construction.

```
┌──────────────────────────────────────────────┐
│            LLM Eval Pipeline                  │
│                                               │
│  GitHub Issue → Task Constructor              │
│       ↓                                       │
│  SWE Task (patch + test_command)              │
│       ↓                                       │
│  LLM generates candidate solution             │
│       ↓                                       │
│  Automated test runner evaluates output       │
│       ↓                                       │
│  Structured result → Dataset record           │
└──────────────────────────────────────────────┘
```

### Running the eval tests

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run the full LLM eval test suite
pytest tests/ -v --tb=short

# Run a specific test class
pytest tests/test_llm_eval.py::TestSWETaskConstruction -v

# Run with coverage report
pytest tests/ --cov=server --cov-report=term-missing
```

### Test coverage areas

| Test Class | What it validates |
|---|---|
| `TestLLMResponseEvaluation` | LLM code output passes test cases, correct format |
| `TestSWETaskConstruction` | Verifiable task structure, serialization, language support |
| `TestGitHubIssueTriage` | Issue classification, prioritization, actionability |
| `TestAIServiceMocked` | AI service layer — prompt building, error handling (no real API calls) |
| `TestDatasetQuality` | Dataset coverage across languages, difficulties, deduplication |

---

## 🐳 Docker Deployment

### Quick start (single container)

```bash
# Build and run
docker build -t prepmate-ai .
docker run -p 5000:5000 \
  -e MONGO_URI=your_mongo_uri \
  -e JWT_SECRET=your_secret \
  -e GEMINI_API_KEY=your_key \
  -e OPENAI_API_KEY=your_key \
  prepmate-ai
```

### Full stack with Docker Compose (recommended)

```bash
# Copy and fill in your secrets
cp .env.example .env

# Start MongoDB + App together
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f app

# Stop everything
docker compose down
```

The compose setup includes:
- **MongoDB 7** with persistent volume and healthcheck
- **Express app** with automatic restart and dependency ordering
- **Health endpoint** at `GET /api/health`

---

## 🚀 Getting Started (Local Dev)

### Prerequisites
- Node.js v18+
- Python 3.10+ (for eval tests)
- MongoDB (local or Atlas)
- Gemini API Key + OpenAI API Key

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/anudeep0011/prepmate_ai.git
cd prepmate_ai

# 2. Install frontend + root deps
npm install

# 3. Install server deps
cd server && npm install && cd ..

# 4. Set up environment variables
cp .env.example server/.env
# → Fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, OPENAI_API_KEY, GOOGLE_CLIENT_ID

# 5. Run frontend + backend concurrently
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for JWT signing |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `PORT` | Optional | Server port (default: 5000) |

---

## 📂 Project Structure

```
prepmate_ai/
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # MongoDB + App orchestration
├── pytest.ini                  # Python test config
├── requirements-test.txt       # Python test dependencies
├── tests/
│   └── test_llm_eval.py        # LLM evaluation & SWE task test suite
├── server/                     # Express.js backend
│   ├── config/                 # DB and app config
│   ├── controllers/            # API route handlers
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # REST endpoints
│   └── services/               # AI integrations (Gemini, OpenAI)
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   ├── context/                # Theme + Auth state
│   ├── hooks/                  # Custom React hooks
│   └── pages/                  # App views
└── public/                     # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Run tests before submitting a PR
pytest tests/ -v
```

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

Built with ❤️ by [Anudeep](https://github.com/anudeep0011)
