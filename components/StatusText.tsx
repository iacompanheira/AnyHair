
import React from 'react';

type Status = 'idle' | 'connecting' | 'listening' | 'error';

interface StatusTextProps {
    status: Status;
    isAiSpeaking: boolean;
    size?: 'large' | 'small';
}

const StatusText: React.FC<StatusTextProps> = ({ status, isAiSpeaking, size = 'large' }) => {
    let text = '';
    switch(status) {
        case 'idle': text = ''; break; // Idle text is handled by CTA
        case 'connecting': text = 'Conectando...'; break;
        case 'listening': text = isAiSpeaking ? 'IA falando' : 'IA ouvindo'; break;
        case 'error': text = 'Erro. Tente novamente'; break;
    }
    if (!text) return null;

    const sizeClass = size === 'large' ? 'text-2xl' : 'text-lg';

    let animationClass = 'text-white/80 animate-fade-in'; // Default

    if (status === 'listening') {
        if (isAiSpeaking) {
            animationClass = 'animate-text-pulse-orange font-semibold';
        } else {
            animationClass = 'animate-text-pulse-teal font-semibold';
        }
    } else if (status === 'connecting') {
        animationClass = 'text-white/80 animate-pulse';
    } else if (status === 'error') {
        animationClass = 'text-red-400';
    }

    return (
        <div
            className={`text-center tracking-wider pointer-events-none transition-all duration-300 ${sizeClass} ${animationClass}`}
            style={status === 'listening' ? {} : {textShadow:'0 2px 4px rgba(0,0,0,0.5)'}}
        >
            {text}
        </div>
    );
}

export default StatusText;
