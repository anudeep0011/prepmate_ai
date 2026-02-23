import { useEffect, useRef, useState } from 'react';

const useAudioVisualizer = (isMicOn) => {
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);
    const streamRef = useRef(null);
    const rafIdRef = useRef(null);

    useEffect(() => {
        if (isMicOn) {
            startVisualizer();
        } else {
            stopVisualizer();
        }
        return () => stopVisualizer();
    }, [isMicOn]);

    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            streamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64; // Low detail needed for simple volume bars

            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);

                // Calculate average volume
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArrayRef.current[i];
                }
                const average = sum / bufferLength;

                // Normalize to 0-100 or 0-1 range
                setVolume(average);

                rafIdRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();

        } catch (error) {
            console.error("Visualizer Error:", error);
        }
    };

    const stopVisualizer = () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
    };

    return volume;
};

export default useAudioVisualizer;
