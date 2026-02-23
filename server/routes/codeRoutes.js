import express from 'express';
import { runCode } from '../services/piston.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/run', protect, async (req, res) => {
    const { language, code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'No code provided' });
    }

    try {
        // Default to javascript if no language provided
        const lang = language || 'javascript';

        const result = await runCode(lang, code);

        res.json(result);
    } catch (error) {
        console.error("Code Execution Route Error:", error);
        res.status(500).json({ message: 'Failed to execute code' });
    }
});

export default router;
