import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateInterviewResponse = async (history, context) => {
    try {
        const systemPrompt = `
        Role: You are an experienced, empathetic, and professional human interviewer named "Alex" conducting a ${context.jobRole} interview.
        Candidate Profile: ${context.experience} years of experience. Difficulty: ${context.difficulty}.
        ${context.resumeText ? `Resume Highlights: ${context.resumeText}` : ''}
        
        Goal: Create a natural, engaging conversation while rigorously assessing the candidate. Avoid robotic responses.
        
        Guidelines:
        1. **Tone**: Convertible and professional, but warm. Use "I understand", "That's interesting", etc.
        2. **Flow**: Do not fire questions rapidly. Acknowledge the user's previous answer before asking the next.
        3. **Context**: Use the candidate's resume to ask specific questions about their projects if available.
        4. **Brevity**: Keep responses concise (under 2-3 sentences) unless explaining a complex concept.
        5. **Proactive**: If the user is stuck, offer a hint.
        
        Current Interaction:
        - Analyze the conversation history.
        - Generate the next optimal response (question, follow-up, or feedback).
        `;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({
                role: msg.sender === 'User' ? 'user' : 'assistant',
                content: msg.text
            }))
        ];

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: 'gpt-4o', // or gpt-3.5-turbo if preferred
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw new Error("Failed to generate interview response");
    }
};

export const generateFeedback = async (history, context) => {
    try {
        const prompt = `
        Analyze the following interview transcript for a ${context.jobRole} role.
        
        Transcript:
        ${JSON.stringify(history)}
        
        Provide a detailed JSON evaluation with:
        1. "score": (0-10)
        2. "title": A brief title for the feedback
        3. "overview": A summary paragraph
        4. "strengths": [Array of string points]
        5. "improvements": [Array of string points]
        6. "notes": Additional closing thoughts
        
        Return ONLY valid JSON.
        `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: "You are an expert interviewer providing detailed feedback JSON." },
                { role: 'user', content: prompt }
            ],
            model: 'gpt-4o',
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI Feedback Error:", error);
        throw new Error("Failed to generate feedback");
    }
};
