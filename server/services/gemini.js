import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// This function handles the Chat Logic (Interview turns) - STREAMING VERSION
export const generateInterviewResponseStream = async (history, context, roundType = 'General', roundPhase = 'Questioning', codingStep = null, userCode = null) => {
    try {
        // 1. Construct Specialized System Prompt
        let systemRole = "You are an expert AI Interviewer.";
        let phaseInstruction = "";

        // Round-Specific Personas
        switch (roundType) {
            case 'HR':
                systemRole = "You are a Senior HR Manager. Focus on culture fit, attitude, confidence, and career goals. Use the STAR method criteria.";
                break;
            case 'Technical':
                systemRole = "You are a Senior Tech Lead. Focus on domain knowledge, problem-solving, and practical understanding. adapting difficulty based on answers.";
                break;
            case 'Behavioral':
                systemRole = "You are a Behavioral Psychologist. Focus on decision-making, teamwork, leadership, and ethics. Ask for specific examples (STAR method).";
                break;
            case 'Managerial':
                systemRole = "You are an Executive Leader. Focus on leadership thinking, strategy, conflict resolution, and accountability. Pose scenario-based questions.";
                break;
            case 'Coding':
                systemRole = "You are a Senior Technical Interviewer at a Top Tech Company (FAANG level). Your goal is to assess Logic, Approach, and Code Quality.";

                // Coding Specific Instruction Flow
                if (codingStep) {
                    switch (codingStep) {
                        case 1: // Problem
                            phaseInstruction = `STEP 1: GENERATE PROBLEM. Generate a single, clear coding problem suitable for a ${context.jobRole} (${context.experience || 'Fresher'} level). 
                             Format: "Problem: [Title]\n\nDescription: [Details]\n\nInput Example:\nOutput Example:\n\nConstraints:". 
                             Do not ask the user for anything yet, just state the problem clearly.`;
                            break;
                        case 2: // Approach
                            phaseInstruction = `STEP 2: APPROACH EXPLANATION. The user is explaining their thoughts. Listen to their logic. 
                             If it's good, say "That sounds like a solid plan. Let's move to pseudo-code."
                             If it's bad or missing edge cases, give a HINT (e.g. "Have you considered empty arrays?"). Do NOT write code yet.`;
                            break;
                        case 3: // Pseudo-Code
                            phaseInstruction = `STEP 3: PSEUDO-CODE. Ask the user to outline the steps or write pseudo-code. 
                             Evaluate if their logic holds up. If yes, say "Great, please implement this in code."`;
                            break;
                        case 4: // Code
                            phaseInstruction = `STEP 4: CODE EVALUATION. User Code: \n\`\`\`\n${userCode || '(User has not written code yet)'}\n\`\`\`\n 
                             Check for syntax errors, logical bugs, and edge cases. 
                             If correct: "Excellent. Your code looks correct."
                             If buggy: Point out the line/logic error specifically.`;
                            break;
                        case 5: // Complexity
                            phaseInstruction = `STEP 5: COMPLEXITY. Ask the user for Time and Space complexity. 
                             Evaluate their answer (e.g., O(n) vs O(n^2)). Then conclude the round.`;
                            break;
                    }
                } else {
                    phaseInstruction = "Conduct a standard coding interview. Ask a problem, then guide them through the solution.";
                }
                break;

            default:
                systemRole = "You are a helpful AI mock interviewer.";
        }

        // Phase-Specific Instructions (Only used if NOT coding round override)
        if (roundType !== 'Coding') {
            switch (roundPhase) {
                case 'Intro':
                    phaseInstruction = "This is the start of the round. Briefly introduce yourself and the focus of this specific round (e.g., 'Now we will move to the Technical round...'). Then ask the first question.";
                    break;
                case 'Questioning':
                    phaseInstruction = "Ask a relevant interview question based on the role and round type. If the user just answered, evaluate it briefly (e.g., 'Good point') and ask the next question or a follow-up.";
                    break;
                case 'Follow-up':
                    phaseInstruction = "Probe deeper into the user's previous answer. Ask 'Why?' or 'How would you handle X edge case?'. Focus on clarity.";
                    break;
                case 'Evaluation':
                    phaseInstruction = "This round is ending. Provide a very brief summary of how they did in this round specifically, then say 'Let's move on'.";
                    break;
            }
        }

        const prompt = `
        ${systemRole}
        Current Turn Context: 
        - Round: ${roundType}
        - Phase: ${roundPhase}
        - Coding Step: ${codingStep || 'N/A'}
        
        Job Role: ${context.jobRole}
        Experience Level: ${context.experience} years
        Job Description: ${context.jobDescription || 'Standard requirements for this role.'}
        Resume Context: ${context.resumeText || 'No resume provided.'}

        Instruction: ${phaseInstruction}
        
        Keep your response conversational, professional, and concise.
        `;

        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.sender === 'User' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            })),
            generationConfig: {
                maxOutputTokens: 300, // Slightly more for coding problems
            },
        });

        // Streaming Response
        const result = await chat.sendMessageStream(prompt);
        return result.stream;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

// This function handles the Final Report generation
export const generateFeedback = async (history, context) => {
    try {
        const prompt = `
        Act as an expert Interview Analyzer. Analyze the following interview transcript for a ${context.jobRole} role.
        
        Transcript:
        ${JSON.stringify(history)}
        
        Generate a detailed "Meeting Summary" in JSON format with the following structure:
        {
            "title": "A short tailored title (e.g. 'Java 8 & Scalability Discussion')",
            "score": (number 1-10 based on candidate performance),
            "overview": "A 3-4 sentence high-level summary of the interview flow and topics discussed.",
            "notes": [
                {
                    "topic": "Topic Heading (e.g. 'Java 8 Features')",
                    "details": ["Bullet point 1", "Bullet point 2"]
                }
            ],
            "strengths": ["Key strength 1", "Key strength 2"],
            "improvements": ["Area for improvement 1"],
            "resources": [
                {
                    "topic": "Weak Topic 1",
                    "youtube_queries": ["Specific search query for YouTube"],
                    "article_queries": ["Specific search query for GeeksForGeeks or Docs"]
                }
            ]
        }
        
        For the "resources" array, identify the top 2-3 weak areas. For each, provide:
        1. A specific YouTube search query (e.g., "Java Multithreading synchronization tutorial").
        2. A specific Google/Article search query focused on GeeksForGeeks or official docs (e.g., "GeeksForGeeks Java Thread life cycle").
        DO NOT invent fake URLs. Provide search queries that will lead to good results.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Clean markdown code blocks if present
        const jsonStr = response.replace(/```json/g, '').replace(/```/g, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Feedback Generation Error:", error);
        return {
            score: 0,
            strengths: ["Error generating feedback"],
            improvements: ["Please try again"],
            suggestedTopics: []
        };
    }
};
