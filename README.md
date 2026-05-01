# PrepMate AI 🚀

> **AI-Powered Technical Interview Preparation Platform**  
> LLM evaluation pipelines • Dockerized deployment • Automated test coverage

PrepMate AI is a full-stack web application that leverages **Google Gemini** and **OpenAI** to deliver personalized, adaptive technical interview coaching. The platform combines an intelligent interviewer, real-time code evaluation, and structured LLM performance assessment—making it ideal for both job seekers and LLM dataset construction.

[![Python Tests](https://img.shields.io/badge/tests-pytest-blue)](./tests/)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker)](./Dockerfile)
[![LLM](https://img.shields.io/badge/LLM-Gemini%20%7C%20OpenAI-orange)](./server/services/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## ✨ Features

- **🤖 AI Interviewer** — Conversational technical & behavioral interviews powered by Google Gemini 1.5 Flash
- **📄 Resume-Aware Personalization** — Upload your resume; AI tailors questions to your specific background and experience
- **💻 Integrated Code Editor** — Monaco Editor (VS Code engine) with real-time syntax highlighting and execution
- **📊 LLM Response Evaluation** — Structured, verifiable scoring of AI-generated code against predefined test cases
- **🧪 SWE Task Construction** — Auto-generated software engineering tasks from repository histories for LLM training datasets
- **🔐 Enterprise Security** — Email/Password authentication + Google OAuth 2.0 with JWT sessions
- **🌓 Dark/Light Mode** — Fully responsive, modern UI with theme persistence

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 18.3 + Vite | Modern component-based UI with fast HMR |
| **Code Editor** | Monaco Editor | Production-grade in-browser code editing |
| **Styling** | Vanilla CSS | Lightweight, responsive design |
| **Icons** | React Icons | Consistent, scalable iconography |
| **Routing** | React Router v6 | Client-side navigation |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js + Express 5.2 | Scalable REST API server |
| **Database** | MongoDB + Mongoose | Document storage with schema validation |
| **Auth** | JWT + BcryptJS | Stateless, secure authentication |
| **Security** | Helmet + Rate Limiter | API hardening & DDoS protection |
| **Logging** | Morgan | HTTP request logging |

### AI & LLM
| Service | Model | Purpose |
|---------|-------|---------|
| **Interview Generation** | Google Gemini 1.5 Flash | Natural language question creation & feedback |
| **Code Evaluation** | OpenAI (GPT-4) | Code analysis, test execution insights |
| **File Handling** | Multer + pdf-parse | Resume parsing and document uploads |

### DevOps & Testing
| Tool | Purpose |
|------|---------|
| **Containerization** | Docker + Docker Compose | Multi-service orchestration |
| **Python Testing** | pytest + pytest-asyncio | LLM evaluation suite |
| **CI/CD** | GitHub Actions | Automated test runs on commit |

---

## 🧠 LLM Evaluation Pipeline

PrepMate AI includes a sophisticated Python-based evaluation framework for assessing LLM performance on realistic software engineering tasks—directly applicable to **LLM training dataset curation and validation**.

### Pipeline Architecture

```
┌──────────────────────────────────────────────┐
│        LLM Evaluation Pipeline               │
├──────────────────────────────────────────────┤
│                                              │
│  GitHub Issue / PR                           │
│       ↓                                      │
│  Task Constructor                            │
│  (language detection, test suite extraction) │
│       ↓                                      │
│  Verifiable SWE Task                         │
│  (problem statement + test commands)         │
│       ↓                                      │
│  LLM Generates Solution                      │
│       ↓                                      │
│  Automated Test Runner                       │
│  (validates correctness, performance)        │
│       ↓                                      │
│  Structured Result → Dataset Record          │
│  (pass/fail, execution time, coverage)       │
│                                              │
└──────────────────────────────────────────────┘
```

### Running Evaluation Tests

```bash
# Install Python test dependencies
pip install -r requirements-test.txt

# Run full test suite with verbose output
pytest tests/ -v --tb=short

# Run specific test class
pytest tests/test_llm_eval.py::TestSWETaskConstruction -v

# Generate coverage report
pytest tests/ --cov=server --cov-report=html
```

### Test Coverage

| Test Module | Validates |
|---|---|
| `TestLLMResponseEvaluation` | Code execution correctness, test case passing, structured response format |
| `TestSWETaskConstruction` | Task serialization, language support, reproducibility |
| `TestGitHubIssueTriage` | Issue classification, priority ranking, actionability metrics |
| `TestAIServiceMocked` | Prompt construction, error recovery, token management (mocked) |
| `TestDatasetQuality` | Language distribution, difficulty balance, deduplication |

---

## 🐳 Docker Deployment

### Single Container Deployment

```bash
# Build image
docker build -t prepmate-ai:latest .

# Run container with environment variables
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/prepmate \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  -e GEMINI_API_KEY=your_gemini_key \
  -e OPENAI_API_KEY=your_openai_key \
  prepmate-ai:latest
```

### Multi-Service Stack (Recommended)

```bash
# Prepare environment
cp .env.example .env
# → Edit .env with your credentials

# Build and start MongoDB + App
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f app

# Stop all services
docker compose down
```

**Docker Compose includes:**
- ✅ MongoDB 7 with persistent volume & health checks
- ✅ Express app with auto-restart policy
- ✅ Service dependency ordering
- ✅ Health endpoint: `GET /api/health`

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** v18 or higher
- **Python** 3.10+ (for evaluation tests)
- **MongoDB** (local instance or MongoDB Atlas cloud)
- **API Keys:**
  - Google Gemini API key ([get it here](https://makersuite.google.com/app/apikey))
  - OpenAI API key ([get it here](https://platform.openai.com/account/api-keys))
  - Google OAuth 2.0 credentials ([console.cloud.google.com](https://console.cloud.google.com))

### Installation & Setup

```bash
# 1. Clone repository
git clone https://github.com/anudeep0011/prepmate_ai.git
cd prepmate_ai

# 2. Install root dependencies
npm install

# 3. Install server dependencies
cd server
npm install
cd ..

# 4. Configure environment
cp .env.example server/.env

# 5. Add your credentials to server/.env
# Required:
#   - MONGO_URI: MongoDB connection string
#   - JWT_SECRET: Random 32-byte hex string for token signing
#   - GEMINI_API_KEY: Google Gemini API key
#   - OPENAI_API_KEY: OpenAI API key
#   - GOOGLE_CLIENT_ID: OAuth client ID

# 6. Start frontend + backend (concurrent)
npm run dev
```

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:5000

### Environment Variables Reference

| Variable | Required | Type | Default | Description |
|----------|----------|------|---------|-------------|
| `MONGO_URI` | ✅ | String | — | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | ✅ | String | — | Secret for signing JWTs (min 32 chars recommended) |
| `GEMINI_API_KEY` | ✅ | String | — | Google Generative AI API key |
| `OPENAI_API_KEY` | ✅ | String | — | OpenAI API key (GPT-4 recommended) |
| `GOOGLE_CLIENT_ID` | ✅ | String | — | Google OAuth 2.0 client ID |
| `PORT` | ❌ | Number | `5000` | Express server port |
| `NODE_ENV` | ❌ | String | `development` | Environment mode |

---

## 📂 Project Structure

```
prepmate_ai/
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # MongoDB + App orchestration
├── pytest.ini                  # Python pytest configuration
├── requirements-test.txt       # Python test dependencies
│
├── tests/
│   └── test_llm_eval.py       # LLM evaluation & task construction tests
│
├── server/                     # Express.js backend
│   ├── config/                # Database & app configuration
│   ├── controllers/           # Route handler logic
│   ├── models/                # MongoDB schemas (Mongoose)
│   ├── routes/                # REST API endpoints
│   ├── services/              # AI integrations (Gemini, OpenAI)
│   ├── middleware/            # Auth, error handling
│   └── server.js              # Express app entry point
│
├── src/                        # React.js frontend
│   ├── components/            # Reusable UI components
│   ├── context/               # Global state (Auth, Theme)
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Route-based page components
│   ├── utils/                 # Helper functions & API calls
│   ├── App.jsx                # Root component
│   └── main.jsx               # React entry point
│
├── public/                    # Static assets (favicon, etc.)
├── index.html                 # HTML template
├── vite.config.js             # Vite build configuration
├── package.json               # Root dependencies
└── .env.example               # Environment variable template
```

---

## 🔧 Available Scripts

### Root Level
```bash
npm run dev          # Start Vite dev server + backend concurrently
npm run build        # Build React app for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint on codebase
```

### Backend (server/)
```bash
npm run start        # Run Express server directly
npm run server       # Run with nodemon (auto-restart)
```

### Testing
```bash
pytest tests/ -v                    # Run all eval tests
pytest tests/ --cov=server          # Generate coverage report
pytest tests/test_llm_eval.py -k TestSWETaskConstruction -v
```

---

## 📋 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | User signup | — |
| `POST` | `/api/auth/login` | Email/password login | — |
| `POST` | `/api/auth/google` | Google OAuth login | — |
| `GET` | `/api/user/profile` | Get user profile | ✅ |
| `POST` | `/api/interview/start` | Initiate interview session | ✅ |
| `POST` | `/api/interview/feedback` | Get AI feedback on response | ✅ |
| `POST` | `/api/code/execute` | Run code against test cases | ✅ |
| `POST` | `/api/resume/upload` | Upload and parse resume | ✅ |
| `GET` | `/api/health` | Service health check | — |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Open an Issue** — Describe the feature or bug fix first
2. **Fork the Repository** — Create your feature branch (`git checkout -b feature/amazing-feature`)
3. **Make Changes** — Write clean, well-tested code
4. **Run Tests** — Ensure all tests pass: `pytest tests/ -v`
5. **Commit** — Use clear commit messages
6. **Push & Create PR** — Link your PR to the issue

### Contribution Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and descriptive

---

## 📝 License

This project is licensed under the **MIT License**—see the [LICENSE](./LICENSE) file for details.

Permission is granted to use this software freely for personal and commercial purposes with proper attribution.

---

## 🙋 Support & Questions

- **Issues** — Report bugs via [GitHub Issues](https://github.com/anudeep0011/prepmate_ai/issues)
- **Discussions** — Ask questions in [GitHub Discussions](https://github.com/anudeep0011/prepmate_ai/discussions)
- **Author** — [@anudeep0011](https://github.com/anudeep0011)

---

## 🚀 Roadmap

- [ ] Multi-language code editor support (Java, C++, Go)
- [ ] Live coding sessions with real interviewers
- [ ] Behavioral interview video recording & playback
- [ ] Personalized study recommendations based on performance
- [ ] Integration with LeetCode and HackerRank
- [ ] Mobile app (React Native)

---

Built with ❤️ by [Anudeep](https://github.com/anudeep0011)

