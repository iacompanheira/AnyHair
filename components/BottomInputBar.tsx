import React, { useState, useEffect, useRef } from 'react';
import type { SpeechRecognition } from '../types';
import { InputCameraIcon, SendIcon, MicIcon } from './Icons';

interface BottomInputBarProps {
    onSendText: (text: string) => void;
    onOpenCamera: () => void;
    isVoiceSessionActive?: boolean;
}

const BottomInputBar: React.FC<BottomInputBarProps> = ({ onSendText, onOpenCamera, isVoiceSessionActive = false }) => {
    const [textInput, setTextInput] = useState('');
    const [isTranscribing, setTranscribing] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [textInput]);

    const handleToggleTranscription = () => {
        if (isTranscribing) {
            recognitionRef.current?.stop();
            return;
        }
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Reconhecimento de fala não é suportado neste navegador.");
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';
        recognitionRef.current = recognition;

        let lastTranscript = textInput;

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    lastTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTextInput(lastTranscript + interimTranscript);
        };

        recognition.onstart = () => setTranscribing(true);
        recognition.onend = () => {
            setTranscribing(false);
            recognitionRef.current = null;
        };
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setTranscribing(false);
        };

        recognition.start();
    };
    
    const handleSend = () => {
        if (textInput.trim()) {
            onSendText(textInput.trim());
            setTextInput('');
        }
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-transparent flex items-end gap-3 animate-fade-in">
             <div className="flex-grow bg-black/30 backdrop-blur-md border border-white/30 rounded-2xl p-2 flex items-end shadow-lg">
                <button
                    onClick={onOpenCamera}
                    className="p-2 text-white/70 hover:text-pink-400 transition-colors"
                    aria-label="Open camera"
                >
                    <InputCameraIcon />
                </button>
                <textarea
                    ref={textareaRef}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder={"Escreva uma mensagem..."}
                    className="flex-grow bg-transparent text-white placeholder-white/50 resize-none outline-none max-h-32 text-lg mx-2"
                    rows={1}
                />
                 <button
                    onClick={handleToggleTranscription}
                    disabled={isVoiceSessionActive}
                    className={`p-2 transition-colors rounded-full ${isTranscribing ? 'text-pink-400 animate-pulse' : 'text-white/70 hover:text-white'} ${isVoiceSessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={isTranscribing ? "Stop transcription" : "Start transcription"}
                >
                   <MicIcon />
                </button>
            </div>
            <button
                onClick={handleSend}
                disabled={!textInput.trim()}
                className="w-12 h-12 bg-pink-500/80 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:bg-pink-600 disabled:bg-pink-500/50 disabled:cursor-not-allowed transform active:scale-90"
                aria-label="Send message"
            >
                <SendIcon />
            </button>
        </div>
    );
};

export default BottomInputBar;