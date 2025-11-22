
import React from 'react';

type Status = 'idle' | 'connecting' | 'listening' | 'error';

interface StopButtonProps {
    onClick: () => void;
    className?: string;
    status?: Status;
    isAiSpeaking?: boolean;
}

const StopButton: React.FC<StopButtonProps> = ({ onClick, className, status, isAiSpeaking }) => {
    const isListening = status === 'listening' && !isAiSpeaking;
    const isSpeaking = status === 'listening' && isAiSpeaking;

    // Logic for animation and organic shape
    let animationClass = '';
    if (isListening) {
        animationClass = 'animate-blob-listen'; // Sky blue slow morph
    } else if (isSpeaking) {
        animationClass = 'animate-blob-speak'; // Rose rapid liquid vibration
    } else {
        // Default/Connecting state
        animationClass = 'bg-gray-500/20 border-gray-400/30 text-gray-100 animate-pulse rounded-full';
    }

    return (
        <button
            onClick={onClick}
            className={`relative flex items-center justify-center transition-all duration-300 active:scale-95 overflow-visible ${animationClass} ${className || ''}`}
            aria-label="Encerrar chamada"
            style={{ transition: 'border-radius 0.5s ease, background-color 0.5s ease, box-shadow 0.5s ease' }}
        >
            {/* Central white vertical lines (Pause Icon) - Kept consistent */}
            <div className="flex justify-center items-center gap-1 h-1/3 pointer-events-none z-10">
                <div className="w-0.5 h-full bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.9)]"></div>
                <div className="w-0.5 h-full bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.9)]"></div>
            </div>
        </button>
    );
};

export default StopButton;
