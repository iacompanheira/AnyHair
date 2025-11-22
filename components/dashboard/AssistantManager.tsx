import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { getProjectCodeContext } from '../../utils/projectCode';
import { ArrowLeftIcon, PaperClipIcon, SendIcon, MicIcon, CloseIcon, ThinkingIcon, CopyIcon, DocumentTextIcon, SpinnerIcon, FilePdfIcon, FileCsvIcon, FileVideoIcon, SpeakerIcon, StopIcon, LinkIcon, CodeBracketIcon, PlayIcon, PauseIcon, VolumeUpIcon, VolumeMuteIcon } from './Icons';
import ToggleSwitch from './ToggleSwitch';
import type { Service, Customer, SalonHoursSettings, MemoryBoxSettings, SpeechRecognition } from '../../types';
import AssistantPersonaManager from './AssistantPersonaManager';
import { decode, decodeAudioData } from '../../utils/audio';


interface AssistantManagerProps {
    onBack: () => void;
    isMemoryEnabled: boolean;
    onMemoryEnabledChange: (enabled: boolean) => void;
    memoryText: string;
    onMemoryTextChange: (text: string) => void;
    memoryBoxSettings: MemoryBoxSettings;
    onMemoryBoxSettingsChange: (settings: MemoryBoxSettings) => void;
    services: Service[];
    customers: Customer[];
    salonHoursSettings: SalonHoursSettings;
}

type ChatMessagePart = { text: string } | { inlineData: { mimeType: string; data: string, fileName?: string } };
type ChatMessage = {
    role: 'user' | 'model';
    parts: ChatMessagePart[];
};

const fileToGenerativePart = async (file: File): Promise<ChatMessagePart | null> => {
    // For text-based files, read them as text directly.
    if (file.type === 'text/plain' || file.type === 'text/csv') {
        try {
            const text = await file.text();
            // Wrap the content with markers to give the model context about the file.
            return { text: `\n\n--- INÍCIO DO ARQUIVO: ${file.name} ---\n${text}\n--- FIM DO ARQUIVO: ${file.name} ---` };
        } catch (e) {
            console.error(`Error reading text file ${file.name}:`, e);
            return { text: `\n\n[Falha ao ler o arquivo de texto: ${file.name}]` };
        }
    }

    // For file types that Gemini can consume directly (images, video, PDF), convert to base64.
    if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf') {
        try {
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            return {
                inlineData: {
                    mimeType: file.type,
                    data: base64Data,
                    fileName: file.name
                }
            };
        } catch(e) {
            console.error(`Error reading file ${file.name} as base64:`, e);
             return { text: `\n\n[Falha ao processar o arquivo: ${file.name}]` };
        }
    }
    
    // Fallback for unsupported file types that might have been selected.
    console.warn(`Unsupported file type: ${file.type}. Skipping file ${file.name}.`);
    return { text: `\n\n[Arquivo '${file.name}' do tipo '${file.type}' não é suportado e foi ignorado.]`};
};


const AssistantManager: React.FC<AssistantManagerProps> = (props) => {
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputText, setInputText] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [attachedLink, setAttachedLink] = useState<string>('');
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isThinkingEnabled, setThinkingEnabled] = useState(false);
    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const [isAnalyzingCode, setIsAnalyzingCode] = useState(false);

    // Voice Conversation State
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
    const [liveTranscript, setLiveTranscript] = useState('');


    // Refs for state inside callbacks
    const isVoiceModeRef = useRef(isVoiceMode);
    useEffect(() => { isVoiceModeRef.current = isVoiceMode }, [isVoiceMode]);
    const isSpeakingRef = useRef(isSpeaking);
    useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking]);
    const isTranscribingRef = useRef(isTranscribing);
    useEffect(() => { isTranscribingRef.current = isTranscribing }, [isTranscribing]);


    // TTS State
    const [isOutputPaused, setIsOutputPaused] = useState(false);
    const [outputVolume, setOutputVolume] = useState(1);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputGainNodeRef = useRef<GainNode | null>(null);
    const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const lastSpokenIndexRef = useRef<number>(-1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const inactivityTimerRef = useRef<number | null>(null);

    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, liveTranscript]);
    
     const handleCopyResponse = useCallback((text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageIndex(index);
        setTimeout(() => setCopiedMessageIndex(null), 2000);
    }, []);

    const handleCodeAnalysis = async () => {
        setIsAnalyzingCode(true);
        setIsLoading(true);

        const userDisplayMessage: ChatMessage = { role: 'user', parts: [{ text: "Analisando o código do projeto para encontrar bugs e gerar prompts de melhoria..." }] };
        setMessages(prev => [...prev, userDisplayMessage]);

        try {
            const projectCode = getProjectCodeContext();
            const metaPrompt = `Você é um engenheiro de software sênior e um especialista em engenharia de prompts, com profundo conhecimento em React, TypeScript e na API Gemini. Sua tarefa é analisar o código-fonte de um projeto de assistente de voz e fornecer insights para melhorá-lo.

Com base nos arquivos do projeto fornecidos abaixo, realize as seguintes tarefas:
1.  **Análise de Código e Identificação de Bugs:** Revise o código em busca de possíveis bugs, erros lógicos, "race conditions", ou práticas que possam levar a um comportamento inesperado. Seja específico sobre o arquivo e a linha, se possível.
2.  **Feedback e Sugestões de Melhoria:** Forneça feedback construtivo sobre a estrutura do código, performance, e experiência do usuário. Sugira melhorias ou refatorações que poderiam tornar o código mais robusto e manutenível.
3.  **Geração de Prompts de Sistema:** Com base na sua análise, crie 3 exemplos de "system prompts" (memória da IA) que eu possa usar no Google AI Studio ou no painel de controle da aplicação. Estes prompts devem ser projetados para corrigir ou melhorar os comportamentos da IA, com base nos problemas que você identificou no código. Eles devem ser práticos e prontos para uso.

Apresente sua resposta de forma clara e organizada, usando Markdown, separando cada uma das três seções.

Aqui está o código do projeto:`;

            const fullPrompt = `${metaPrompt}\n\n${projectCode}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fullPrompt,
                config: {
                    thinkingConfig: { thinkingBudget: 16384 },
                }
            });

            const modelResponse: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
            setMessages(prev => [...prev, modelResponse]);

        } catch (error) {
            console.error("Code Analysis Error:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Desculpe, ocorreu um erro ao analisar o código do projeto." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAnalyzingCode(false);
            setIsLoading(false);
        }
    };

    const handleSendMessage = useCallback(async (textToSend?: string) => {
        const messageText = textToSend || inputText.trim();
        if ((!messageText && attachments.length === 0 && !attachedLink) || isLoading) return;

        setIsLoading(true);
        if (recognitionRef.current) recognitionRef.current.stop();

        // Keep current inputs for processing, then clear state
        const currentAttachments = [...attachments];
        const currentAttachedLink = attachedLink;
        
        // --- 1. Prepare and display user message in UI immediately ---
        const filePartsForDisplay = await Promise.all(currentAttachments.map(fileToGenerativePart));
        
        const userDisplayParts: ChatMessagePart[] = filePartsForDisplay.filter((p): p is ChatMessagePart => p !== null);

        if (messageText) {
            userDisplayParts.push({ text: messageText });
        }
        if (currentAttachedLink) {
             // Show a clean version in the UI, not the full prompt instruction
            userDisplayParts.push({ text: `\n[Analisando Link: ${currentAttachedLink}]` });
        }

        const userDisplayMessage: ChatMessage = { role: 'user', parts: userDisplayParts };
        setMessages(prev => [...prev, userDisplayMessage]);
        
        // --- 2. Clear inputs ---
        setInputText('');
        setAttachments([]);
        setAttachedLink('');
        setLiveTranscript('');
        
        try {
            // --- 3. Prepare content with specific instructions for the model ---
            const modelContentParts: ChatMessagePart[] = filePartsForDisplay.filter((p): p is ChatMessagePart => p !== null);
            
            let modelText = messageText;
            if (currentAttachedLink) {
                // Prepend the instruction to the text that will be sent to the model.
                const linkInstruction = `Por favor, analise o conteúdo do seguinte link: ${currentAttachedLink}`;
                const userRequest = messageText 
                    ? `Após a análise, responda à minha seguinte solicitação: "${messageText}"`
                    : 'Após a análise, forneça um resumo do conteúdo.';
                
                modelText = `${linkInstruction}\n\n${userRequest}`;
            }

            if (modelText) {
                 modelContentParts.push({ text: modelText });
            }

            // --- 4. Call API and display model response ---
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: modelContentParts }, // Send the specially crafted parts
                config: {
                    ...(isThinkingEnabled && { thinkingConfig: { thinkingBudget: 8192 } }),
                    ...(currentAttachedLink && { tools: [{ googleSearch: {} }] }),
                }
            });

            const modelResponse: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
            setMessages(prev => [...prev, modelResponse]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Desculpe, ocorreu um erro ao processar sua solicitação." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [attachments, attachedLink, inputText, isLoading, isThinkingEnabled, ai]);
    
    const startTranscription = useCallback(() => {
        if (isTranscribingRef.current || isSpeakingRef.current || !isVoiceModeRef.current) return;

        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            alert("Reconhecimento de fala não é suportado neste navegador.");
            setIsVoiceMode(false);
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';
        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript.trim() + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setLiveTranscript(finalTranscript + interimTranscript);
            
            if (finalTranscript) {
                 inactivityTimerRef.current = window.setTimeout(() => {
                    recognition.stop();
                }, 1500); // Stop after 1.5 seconds of silence
            }
        };

        recognition.onstart = () => setIsTranscribing(true);
        recognition.onend = () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            setIsTranscribing(false);
            recognitionRef.current = null;
            if (liveTranscript.trim()) {
                handleSendMessage(liveTranscript.trim());
            } else if (isVoiceModeRef.current && !isSpeakingRef.current) {
                 setTimeout(startTranscription, 100);
            }
        };
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsTranscribing(false);
            if (isVoiceModeRef.current) setIsVoiceMode(false);
        };

        recognition.start();
    }, [handleSendMessage, liveTranscript]);
    
    const stopPlayback = useCallback(() => {
        if (currentAudioSourceRef.current) {
            currentAudioSourceRef.current.onended = null;
            currentAudioSourceRef.current.stop();
            currentAudioSourceRef.current = null;
        }
        setIsSpeaking(false);
        setSpeakingIndex(null);
        setIsOutputPaused(false);
    }, []);

    const handleSpeakResponse = useCallback(async (text: string, index: number) => {
        stopPlayback();
        setIsSpeaking(true);
        setSpeakingIndex(index);
    
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                },
            });
    
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                     outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                     outputGainNodeRef.current = outputAudioContextRef.current.createGain();
                     outputGainNodeRef.current.connect(outputAudioContextRef.current.destination);
                }
                const outputCtx = outputAudioContextRef.current;
                if (outputCtx.state === 'suspended') await outputCtx.resume();
                
                if(outputGainNodeRef.current) {
                    outputGainNodeRef.current.gain.value = outputVolume;
                }
                
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                
                if (outputCtx.state === 'closed') throw new Error("Audio context closed during processing.");

                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputGainNodeRef.current!);
                source.onended = () => {
                    // Check if it's the current source before resetting state
                    if (currentAudioSourceRef.current === source) {
                        stopPlayback();
                    }
                };
                source.start();
                currentAudioSourceRef.current = source;
            } else {
                 stopPlayback();
            }
        } catch (error) {
            console.error("TTS Error:", error);
            stopPlayback();
        }
    }, [ai, stopPlayback, outputVolume]);

    // Effect to automatically speak new model messages in voice mode
    useEffect(() => {
        if (isVoiceMode && messages.length > 0 && !isLoading) {
            const lastMessage = messages[messages.length - 1];
            const lastMessageIndex = messages.length - 1;

            if (lastMessage.role === 'model' && lastSpokenIndexRef.current < lastMessageIndex) {
                const textToSpeak = lastMessage.parts.map(p => 'text' in p ? p.text : '').join('\n');
                if (textToSpeak) {
                    lastSpokenIndexRef.current = lastMessageIndex;
                    handleSpeakResponse(textToSpeak, lastMessageIndex);
                }
            }
        }
    }, [messages, isVoiceMode, isLoading, handleSpeakResponse]);

    // This is the CRITICAL fix. It creates the continuous loop.
    useEffect(() => {
        if (isVoiceMode && !isSpeaking && !isTranscribing && !isLoading) {
            // After AI finishes speaking (isSpeaking becomes false), restart listening.
            startTranscription();
        }
    }, [isVoiceMode, isSpeaking, isTranscribing, isLoading, startTranscription]);


    const handleManualSpeakResponse = (text: string, index: number) => {
        if (speakingIndex === index && isSpeaking) {
            stopPlayback();
        } else {
            handleSpeakResponse(text, index);
        }
    };

    const handleVoiceModeToggle = () => {
        if (isVoiceMode) {
            setIsVoiceMode(false);
            if (recognitionRef.current) recognitionRef.current.stop();
            stopPlayback();
            setIsTranscribing(false);
            setLiveTranscript('');
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        } else {
            setIsVoiceMode(true);
            setInputText('');
            setAttachments([]);
            setAttachedLink('');
            // The useEffect will kick off the first transcription
        }
    };
    
    const handleTogglePlayPause = () => {
        if (!isSpeaking || !outputAudioContextRef.current) return;

        if (outputAudioContextRef.current.state === 'running') {
            outputAudioContextRef.current.suspend().then(() => setIsOutputPaused(true));
        } else if (outputAudioContextRef.current.state === 'suspended') {
            outputAudioContextRef.current.resume().then(() => setIsOutputPaused(false));
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setOutputVolume(newVolume);
    };

    useEffect(() => {
        if (outputGainNodeRef.current) {
            outputGainNodeRef.current.gain.value = outputVolume;
        }
    }, [outputVolume]);
    
     const AttachmentPreview: React.FC<{file: File}> = ({ file }) => {
        let icon = <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
        if (file.type.startsWith('image/')) icon = <img src={URL.createObjectURL(file)} alt={file.name} className="w-5 h-5 object-cover rounded-sm" />;
        if (file.type.startsWith('video/')) icon = <FileVideoIcon className="w-5 h-5 text-purple-500" />;
        if (file.type === 'application/pdf') icon = <FilePdfIcon className="w-5 h-5 text-red-500" />;
        if (file.type === 'text/csv') icon = <FileCsvIcon className="w-5 h-5 text-green-500"/>;

        return (
            <div className="bg-gray-200 rounded-lg px-2 py-1 text-xs flex items-center gap-1.5">
                {icon}
                <span className="truncate max-w-[100px]">{file.name}</span>
            </div>
        );
    };

    const LinkModal: React.FC<{onClose: () => void, onAdd: (url: string) => void}> = ({ onClose, onAdd }) => {
        const [url, setUrl] = useState('');
        
        const handleAdd = () => {
            if (url.trim()) {
                onAdd(url.trim());
                onClose();
            }
        };

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Analisar Conteúdo de um Link</h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                    </header>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-gray-600">Cole uma URL de um site, vídeo do YouTube, ou imagem para que a IA possa analisar seu conteúdo.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">URL</label>
                            <div className="flex gap-2">
                               <input 
                                    type="text" 
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="https://..."
                                    className="flex-grow px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                               />
                               <button onClick={handleAdd} className="px-4 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">Analisar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800">
            {isLinkModalOpen && <LinkModal onClose={() => setIsLinkModalOpen(false)} onAdd={setAttachedLink} />}

            <header className="flex items-center mb-4 flex-shrink-0">
                <button onClick={props.onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">AI Studio</h3>
            </header>

            <div className="flex-grow bg-white/90 border border-gray-200 rounded-xl shadow-sm p-4 h-[600px] flex flex-col">
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4">
                     {messages.length === 0 && !isVoiceMode && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <ThinkingIcon className="w-16 h-16 mb-4" />
                            <h4 className="text-lg font-semibold">Bem-vindo ao AI Studio</h4>
                            <p className="max-w-md">Use o campo abaixo para interagir via texto, anexe arquivos, analise links ou clique no microfone para uma conversa por voz.</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                             {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">A</div>}
                             <div className={`w-auto max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}>
                                {msg.parts.map((part, pIndex) => {
                                    if ('text' in part) return <p key={pIndex} className="whitespace-pre-wrap">{part.text}</p>;
                                    if ('inlineData' in part && part.inlineData.mimeType.startsWith('image/')) {
                                        return <img key={pIndex} src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} className="max-w-xs rounded-lg mt-2" alt={part.inlineData.fileName}/>
                                    }
                                     if ('inlineData' in part && (part.inlineData.mimeType.startsWith('video/') || part.inlineData.mimeType === 'application/pdf')) {
                                        return <div key={pIndex} className="mt-2 text-sm">Arquivo enviado: <strong>{part.inlineData.fileName}</strong></div>
                                    }
                                    return null;
                                })}
                                {msg.role === 'model' && !isVoiceMode && (
                                    <div className="text-right mt-2 flex items-center justify-end gap-3">
                                        <button onClick={() => handleManualSpeakResponse(msg.parts.map(p => 'text' in p ? p.text : '').join('\n'), index)} className="text-gray-500 hover:text-pink-600">
                                            {speakingIndex === index ? <StopIcon className="w-5 h-5 text-red-500" /> : <SpeakerIcon className="w-5 h-5" />}
                                        </button>
                                        <button onClick={() => handleCopyResponse(msg.parts.map(p => 'text' in p ? p.text : '').join('\n'), index)} className="text-xs font-semibold text-gray-500 hover:text-pink-600 flex items-center gap-1">
                                             <CopyIcon className="w-4 h-4" /> {copiedMessageIndex === index ? 'Copiado!' : 'Copiar'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">V</div>}
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">A</div>
                            <div className="w-auto max-w-xl p-3 rounded-xl bg-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {liveTranscript && (
                         <div className="flex items-start gap-3 justify-end">
                            <div className="w-auto max-w-xl p-3 rounded-xl bg-pink-200 text-pink-800 italic">
                                <p>{liveTranscript}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">V</div>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 mt-4">
                     {(attachments.length > 0 || attachedLink) && !isVoiceMode && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 px-2">
                            <span className="font-semibold">Anexos:</span> 
                            <div className="flex flex-wrap gap-1">
                                {attachments.map((f, i) => <AttachmentPreview key={i} file={f} />)}
                                {attachedLink && (
                                    <div className="bg-blue-100 text-blue-800 rounded-lg px-2 py-1 text-xs flex items-center gap-1.5">
                                        <LinkIcon className="w-4 h-4" />
                                        <span className="truncate max-w-[100px]">{attachedLink}</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => {setAttachments([]); setAttachedLink('');}} className="ml-auto text-red-500 font-bold text-lg leading-none">&times;</button>
                        </div>
                    )}

                    {isVoiceMode ? (
                        <div className="flex flex-col items-center justify-center p-3">
                             <p className="h-6 text-gray-600 italic mb-3">
                                {isTranscribing ? "Ouvindo..." : isSpeaking ? "IA falando..." : isLoading ? "Processando..." : "Clique para parar"}
                            </p>
                            <button onClick={handleVoiceModeToggle} className={`w-16 h-16 text-white rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-colors ${isTranscribing ? 'bg-pink-500 animate-pulse' : 'bg-red-500'}`}>
                                {isTranscribing ? <MicIcon /> : <StopIcon className="w-8 h-8" />}
                            </button>
                            <p className="text-sm text-gray-500 mt-2">Modo de conversação ativo</p>
                        </div>
                    ) : (
                        <>
                        <div className={`flex items-center gap-3 px-3 py-2 mb-2 bg-gray-100 border border-gray-200 rounded-lg transition-opacity ${isSpeaking ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <button onClick={handleTogglePlayPause} className="p-2 text-gray-600 hover:text-pink-500 rounded-full">
                                {isOutputPaused ? <PlayIcon className="w-6 h-6" /> : <PauseIcon className="w-6 h-6" />}
                            </button>
                            <VolumeMuteIcon className="w-5 h-5 text-gray-500" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={outputVolume}
                                onChange={handleVolumeChange}
                                className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                            <VolumeUpIcon className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="bg-white border border-gray-300 rounded-xl p-2 flex items-center gap-2 shadow-sm">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={(e) => e.target.files && setAttachments(a => [...a, ...Array.from(e.target.files!)])} 
                                multiple 
                                accept="image/*,video/*,.pdf,.txt,.csv" 
                                className="hidden" 
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-pink-500 transition-colors rounded-full"><PaperClipIcon /></button>
                            <button onClick={() => setIsLinkModalOpen(true)} className="p-2 text-gray-500 hover:text-pink-500 transition-colors rounded-full"><LinkIcon /></button>
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                placeholder="Escreva algo, cole um link..." 
                                className="flex-grow bg-transparent outline-none text-gray-800"
                            />
                            <button onClick={handleVoiceModeToggle} className="p-2 transition-colors rounded-full text-gray-500 hover:text-pink-500">
                                <MicIcon />
                            </button>
                            <button onClick={() => handleSendMessage()} disabled={isLoading || (!inputText.trim() && attachments.length === 0 && !attachedLink)} className="p-2 text-white bg-pink-500 rounded-full hover:bg-pink-600 disabled:bg-gray-400 transition-colors">
                                {isLoading ? <SpinnerIcon className="w-6 h-6" /> : <SendIcon />}
                            </button>
                        </div>
                        <div className="flex justify-end items-center mt-2 pr-2 gap-4">
                             <button
                                onClick={handleCodeAnalysis}
                                disabled={isLoading || isAnalyzingCode}
                                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-pink-600 disabled:opacity-50 transition-colors"
                            >
                                <CodeBracketIcon className="w-5 h-5" />
                                Analisar Código do Projeto
                            </button>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                Pensamento Avançado
                                <ToggleSwitch enabled={isThinkingEnabled} onChange={setThinkingEnabled} />
                            </label>
                        </div>
                        </>
                    )}
                </div>
            </div>
            
            <div className="mt-6">
                 {/* Persona Manager for the main screen assistant */}
                 <AssistantPersonaManager {...props} />
            </div>
        </div>
    );
};

export default AssistantManager;