import { useState, useEffect, useRef } from 'react';

const useNativeSpeech = (isMicOn) => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Browser does not support Speech Recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    setTranscript(event.results[i][0].transcript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // For real-time feedback, you might want interim too, but for now strict final or last interim
            if (interimTranscript) setTranscript(interimTranscript);
        };

        recognition.onerror = (event) => {
            if (event.error === 'aborted' || event.error === 'no-speech') return;
            console.error("Speech Error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Auto-restart if it shouldn't have stopped
            if (isMicOn) {
                try {
                    recognition.start();
                } catch (e) {
                    // Ignore already started errors
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [isMicOn]); // Re-init if Mic State drastically changes (optional, usually just keep instance)

    useEffect(() => {
        if (isMicOn && recognitionRef.current && !isListening) {
            try { recognitionRef.current.start(); } catch (e) { }
        } else if (!isMicOn && recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isMicOn, isListening]);

    const resetTranscript = () => setTranscript('');

    return { transcript, isListening, resetTranscript };
};

export default useNativeSpeech;
