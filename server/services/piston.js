import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Map our frontend language names to Piston language names and versions
// Piston versions change, so we might want to fetch them dynamically or hardcode mostly used ones
export const runCode = async (language, code) => {
    try {
        // Simple mapping for now. Piston supports many.
        let lang = language.toLowerCase();
        let version = '*'; // Use latest available

        if (lang === 'javascript' || lang === 'js') lang = 'javascript';
        if (lang === 'python' || lang === 'py') lang = 'python';
        if (lang === 'java') lang = 'java';
        if (lang === 'cpp' || lang === 'c++') lang = 'c++';

        const response = await axios.post(`${PISTON_API_URL}/execute`, {
            language: lang,
            version: version,
            files: [
                {
                    content: code
                }
            ]
        });

        return response.data;
    } catch (error) {
        console.error("Piston Interaction Failed:", error);
        throw new Error(error.response?.data?.message || 'Code execution failed');
    }
};
