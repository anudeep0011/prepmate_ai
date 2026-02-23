import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for pdfjs-dist@3.11.174
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';
        }

        return fullText.trim();
    } catch (error) {
        console.error("PDF Extraction Failed:", error);
        // Throw the ACTUAL error message so we can debug
        throw new Error(error.message || "Unknown PDF parsing error");
    }
};
