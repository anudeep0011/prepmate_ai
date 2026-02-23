# PrepMate AI 🚀

PrepMate AI is a cutting-edge, AI-powered interview preparation platform designed to help candidates ace their technical and behavioral interviews. By leveraging advanced generative AI models (Gemini & OpenAI), PrepMate AI provides personalized feedback, real-time code evaluation, and realistic interview simulations.

![PrepMate AI Banner](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070)

## ✨ Features

- **🤖 AI Interviewer**: Engage in realistic technical and behavioral interview sessions driven by Gemini 1.5 Flash.
- **📄 Resume Parsing**: Upload your resume and let the AI tailor the interview questions to your specific experience.
- **💻 Integrated Code Editor**: Solve coding problems directly within the platform using the Monaco Editor (the power behind VS Code).
- **📈 Real-time Feedback**: Receive detailed analysis and improvement suggestions after every session.
- **🔐 Secure Authentication**: Multi-method login including Email/Password and Google OAuth integration.
- **🌓 Dynamic UI**: Sleek, modern design with full dark/light mode support.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js
- **Tooling**: Vite (for lightning-fast builds)
- **Styling**: Vanilla CSS (Modern, Responsive)
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Icons**: React Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Security**: Helmet, Rate Limiter, BcryptJS, JWT

### AI & Integrations
- **AI Models**: Google Generative AI (Gemini), OpenAI API
- **Auth**: Google OAuth 2.0
- **Storage**: Multer for handling resume uploads

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Cloud Console Project (for OAuth)
- Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anudeep0011/prepmate_ai.git
   cd prepmate_ai
   ```

2. **Install dependencies**
   ```bash
   # Install root and frontend dependencies
   npm install

   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the `server` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the Application**
   ```bash
   # Run frontend and backend concurrently (recommended)
   npm run dev

   # Or run them separately
   # In one terminal:
   npm run dev
   # In another terminal:
   npm run server
   ```

## 📂 Project Structure

```text
PrepMateAI/
├── server/             # Express.js backend
│   ├── config/         # Database and app config
│   ├── controllers/    # API logic
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   └── services/       # AI and external integrations
├── src/                # React frontend
│   ├── components/     # Reusable UI components
│   ├── context/        # State management (Theme, Auth)
│   ├── hooks/          # Custom React hooks
│   └── pages/          # Main application views
└── public/             # Static assets
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by [Anudeep](https://github.com/anudeep0011)
