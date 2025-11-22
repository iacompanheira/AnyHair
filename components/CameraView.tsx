import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SwitchCameraIcon } from './Icons';

interface CameraViewProps {
    onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

    const handleSwitchCamera = useCallback(() => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        const getStream = async () => {
            let stream: MediaStream | null = null;
            try {
                // Tenta obter a câmera com o modo de faceamento desejado primeiro
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
            } catch (err) {
                console.warn(`Não foi possível obter a câmera com facingMode ${facingMode}:`, err);
                try {
                    // Fallback para qualquer dispositivo de vídeo se o modo de faceamento específico falhar
                    console.log("Fallback para qualquer dispositivo de vídeo");
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                } catch (finalErr) {
                     console.error("Camera error:", finalErr);
                     alert("Não foi possível acessar a câmera. Verifique as permissões no seu navegador.");
                     onClose();
                }
            }

            if (stream && videoRef.current) {
                streamRef.current = stream;
                videoRef.current.srcObject = stream;
            }
        };

        getStream();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [onClose, facingMode]);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="relative w-full h-full" onClick={e => e.stopPropagation()}>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain"></video>
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-white bg-black/30 rounded-full p-2 hover:bg-black/60 transition-colors"
                    aria-label="Fechar visualização da câmera"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <button onClick={handleSwitchCamera} className="p-3 bg-black/40 rounded-full hover:bg-black/60 transition-colors" aria-label="Alternar câmera">
                        <SwitchCameraIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraView;
