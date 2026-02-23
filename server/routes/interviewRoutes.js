import express from 'express';
import { generateInterviewResponseStream, generateFeedback } from '../services/gemini.js';
// import { generateInterviewResponse, generateFeedback } from '../services/openai.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const router = express.Router();

// Configure Multer for PDF Uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

import { protect } from '../middleware/authMiddleware.js';

router.post('/chat', protect, async (req, res) => {
    try {
        const { history, context, roundType, roundPhase, codingStep, userCode } = req.body;

        if (!context || !history) {
            return res.status(400).json({ message: "Missing history or context" });
        }

        // Set Headers for Streaming
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        const stream = await generateInterviewResponseStream(history, context, roundType, roundPhase, codingStep, userCode);

        for await (const chunk of stream) {
            const chunkText = chunk.text();
            res.write(chunkText);
        }

        res.end();

    } catch (error) {
        console.error("Streaming Error:", error);
        // If headers haven't been sent, send JSON error. 
        // If partial stream sent, just end it (client will handle incomplete data).
        if (!res.headersSent) {
            res.status(500).json({ message: "AI Processing Failed" });
        } else {
            res.end();
        }
    }
});

router.post('/feedback', protect, async (req, res) => {
    const { history, context, userId } = req.body;

    if (!history || !context || !userId) {
        return res.status(400).json({ message: "Missing data" });
    }

    try {
        const feedbackData = await generateFeedback(history, context);

        // Save to DB
        const interview = await Interview.create({
            user: userId,
            jobRole: context.jobRole,
            difficulty: context.difficulty || 'Medium',
            interviewType: context.interviewType || 'General',
            score: feedbackData.score,
            summary: {
                title: feedbackData.title,
                overview: feedbackData.overview,
                notes: feedbackData.notes
            },
            feedback: {
                strengths: feedbackData.strengths,
                improvements: feedbackData.improvements
            },
            transcript: history // Save the full chat history
        });

        res.json(interview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Feedback Generation Failed" });
    }
});

router.get('/history/:userId', protect, async (req, res) => {
    try {
        const interviews = await Interview.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ message: "Fetch History Failed" });
    }
});


// Resume Upload Route
// Resume Upload Route - Wrapped for debugging
// // Resume Upload Route - DEPRECATED (Moved to Client-Side Paste)
// router.post('/resume-upload', protect, (req, res, next) => {
//     console.log("Incoming request to /resume-upload");
//     console.log("Request headers:", req.headers);

//     upload.single('file')(req, res, (err) => {
//         if (err instanceof multer.MulterError) {
//             console.error("Multer Error:", err);
//             if (err.code === 'LIMIT_FILE_SIZE') {
//                 return res.status(400).json({ message: "File is too large. Max size is 5MB." });
//             }
//             return res.status(400).json({ message: "File upload error", error: err.message });
//         } else if (err) {
//             console.error("Upload Error:", err);
//             return res.status(400).json({ message: err.message });
//         }
//         next();
//     });
// }, async (req, res) => {
//     console.log("Multer passed. File:", req.file);
//     if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded (req.file is undefined)" });
//     }

//     try {
//         const data = await pdf(req.file.buffer);
//         console.log("PDF Parsed successfully. Text length:", data.text.length);
//         res.json({ text: data.text });
//     } catch (error) {
//         console.error("Resume Parsing Error:", error);
//         res.status(500).json({ message: `Failed to parse resume: ${error.message}`, details: error.toString() });
//     }
// });

export default router;
