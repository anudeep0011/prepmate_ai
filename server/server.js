import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Validation for required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY', 'OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(`❌ Critical Error: Missing Environment Variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/code', codeRoutes);

app.get('/', (req, res) => {
    res.send('PrepMate AI API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received. Closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
});

