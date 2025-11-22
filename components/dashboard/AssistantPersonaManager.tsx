import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fromYYYYMMDD, formatFullDate } from '../../utils/date';
import { formatServicesForPrompt, formatCustomersForPrompt, formatSalonHoursForPrompt } from '../../utils/promptFormatters';
import { ClipboardListIcon, UsersIcon, ClockIcon, InfoIcon, ChevronDownIcon, TrashIcon } from './Icons';
import SaveBar from './SaveBar';
import ToggleSwitch from './ToggleSwitch';
import type { Service, Customer, SalonHoursSettings, DayHours, StandardHours, MemoryBoxSettings } from '../../types';
import { memoryBoxStructure } from '../../constants/memoryBoxStructure';

interface AssistantPersonaManagerProps {
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

const Accordion: React.FC<React.PropsWithChildren<{ title: string, initiallyOpen?: boolean }>> = ({ title, initiallyOpen = false, children }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="bg-white/95 border border-gray-200 rounded-xl">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                <h3 className="text-md font-semibold text-gray-700">{title}</h3>
                <ChevronDownIcon className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 border-t border-gray-200 animate-fade-in">{children}</div>}
        </div>
    );
};

const HelpTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative flex items-center ml-2">
        <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded-md p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {text}
        </div>
    </div>
);

const AssistantPersonaManager: React.FC<AssistantPersonaManagerProps> = ({
    isMemoryEnabled: initialIsMemoryEnabled,
    onMemoryEnabledChange,
    memoryText: initialMemoryText,
    onMemoryTextChange,
    memoryBoxSettings: initialMemoryBoxSettings,
    onMemoryBoxSettingsChange,
    services,
    customers,
    salonHoursSettings,
}) => {
    const [localEnabled, setLocalEnabled] = useState(initialIsMemoryEnabled);
    const [localText, setLocalText] = useState(initialMemoryText);
    const [localMemoryBoxSettings, setLocalMemoryBoxSettings] = useState(initialMemoryBoxSettings);
    const [hasPersonaChanges, setHasPersonaChanges] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const mainTextAreaRef = useRef<HTMLTextAreaElement>(null);
    const [openTipsId, setOpenTipsId] = useState<string | null>(null);
     const [contextToggles, setContextToggles] = useState({ services: false, customers: false, salonHours: false });
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    useEffect(() => {
        const changesExist = localEnabled !== initialIsMemoryEnabled || 
                             localText !== initialMemoryText ||
                             JSON.stringify(localMemoryBoxSettings) !== JSON.stringify(initialMemoryBoxSettings);
        setHasPersonaChanges(changesExist);
    }, [localEnabled, localText, localMemoryBoxSettings, initialIsMemoryEnabled, initialMemoryText, initialMemoryBoxSettings]);

    const handleSavePersona = () => {
        onMemoryEnabledChange(localEnabled);
        onMemoryTextChange(localText);
        onMemoryBoxSettingsChange(localMemoryBoxSettings);
    };

    const handleCancelPersona = () => {
        setLocalEnabled(initialIsMemoryEnabled);
        setLocalText(initialMemoryText);
        setLocalMemoryBoxSettings(initialMemoryBoxSettings);
    };

    const handleRefinePersona = async () => {
        if (!localText.trim()) {
            alert("Por favor, insira algumas ideias primeiro.");
            return;
        }
        setIsRefining(true);
        try {
            const model = 'gemini-2.5-pro';
            const prompt = `Você é um especialista em engenharia de prompts para IAs de atendimento. Sua tarefa é pegar as anotações brutas e desorganizadas de um dono de salão de beleza e transformá-las em um "system prompt" (memória/persona) claro, estruturado e eficaz para a assistente virtual do salão.

O resultado final deve ser um texto coeso, escrito na segunda pessoa (como se estivesse instruindo a IA), cobrindo todos os pontos mencionados nas anotações. Use formatação como títulos, listas e negrito para organizar as regras.

Anotações brutas do usuário:
---
${localText}
---

Transforme isso em um prompt de sistema profissional.`;

            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });

            setLocalText(response.text);

        } catch (error) {
            console.error("Error refining persona:", error);
            alert("Ocorreu um erro ao refinar a persona. Tente novamente.");
        } finally {
            setIsRefining(false);
        }
    };

    const handleInjectData = (data: string) => {
        setLocalText(prev => prev.trim() === '' ? data : `${prev}\n\n${data}`);
        setTimeout(() => {
            const textarea = mainTextAreaRef.current;
            if (textarea) {
                textarea.focus();
                textarea.scrollTop = textarea.scrollHeight;
            }
        }, 0);
    };

     const handleTipChange = (promptId: string, tipIndex: number, newTipValue: string) => {
        setLocalMemoryBoxSettings(prev => {
            const existingPrompt = prev[promptId] || { value: '', tips: [] };
            const newTips = [...existingPrompt.tips];
            newTips[tipIndex] = newTipValue;
            return {
                ...prev,
                [promptId]: {
                    ...existingPrompt,
                    tips: newTips
                }
            };
        });
    };
    const addTip = (promptId: string) => {
         setLocalMemoryBoxSettings(prev => {
            const existingPrompt = prev[promptId] || { value: '', tips: [] };
            return {
                ...prev,
                [promptId]: {
                    ...existingPrompt,
                    tips: [...existingPrompt.tips, '']
                }
            };
        });
    };
    const deleteTip = (promptId: string, tipIndex: number) => {
         setLocalMemoryBoxSettings(prev => {
            const existingPrompt = prev[promptId] || { value: '', tips: [] };
            const newTips = existingPrompt.tips.filter((_, i) => i !== tipIndex);
             return {
                ...prev,
                [promptId]: {
                    ...existingPrompt,
                    tips: newTips
                }
            };
        });
    };

    return (
        <div className="space-y-6 relative">
            <h3 className="text-xl font-semibold text-gray-700">Persona e Memória da Assistente de Voz</h3>
            <p className="text-sm text-gray-600 -mt-4">Aqui você configura o comportamento da assistente de voz da tela inicial.</p>
            <div className="bg-white/80 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                    <h4 className="text-md text-gray-700 font-semibold">Ativar Memória da Assistente</h4>
                    <p className="text-sm text-gray-500">Define a personalidade e as regras para a assistente de voz da tela inicial.</p>
                </div>
                <ToggleSwitch enabled={localEnabled} onChange={setLocalEnabled} />
            </div>
            
            <div className={`space-y-6 transition-opacity ${!localEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <Accordion title="Caixa de Memórias (Regras de Alta Prioridade)">
                    <p className="text-sm text-gray-500 mb-4">Defina aqui as regras de alta prioridade da IA, organizadas em seções. Estas regras são superiores às diretrizes gerais.</p>
                    <div className="space-y-3">
                        {memoryBoxStructure.map(category => (
                            <Accordion key={category.title} title={category.title}>
                                <div className="space-y-4">
                                    {category.prompts.map(prompt => (
                                        <div key={prompt.id} className="bg-white/95 p-3 rounded-lg border border-gray-200">
                                            <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                                                {prompt.label}
                                                <HelpTooltip text={prompt.hint} />
                                            </label>
                                            <input 
                                                type="text"
                                                value={localMemoryBoxSettings[prompt.id]?.value || ''}
                                                 onChange={(e) => setLocalMemoryBoxSettings(prev => ({
                                                    ...prev, 
                                                    [prompt.id]: { ...(prev[prompt.id] || { tips: [] }), value: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                                            />
                                             <div className="mt-2">
                                                <button onClick={() => setOpenTipsId(openTipsId === prompt.id ? null : prompt.id)} className="text-xs font-semibold text-pink-600 hover:underline flex items-center gap-1">
                                                    <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${openTipsId === prompt.id ? 'rotate-180' : ''}`} />
                                                    Adicionar Dicas de Inspiração
                                                </button>
                                                {openTipsId === prompt.id && (
                                                    <div className="mt-2 p-3 bg-gray-100 rounded-md space-y-2 animate-fade-in">
                                                        <p className="text-xs text-gray-500">Estas dicas são apenas inspirações para a IA, não são regras. O texto principal acima é o que prevalece.</p>
                                                        {(localMemoryBoxSettings[prompt.id]?.tips || []).map((tip, tipIndex) => (
                                                            <div key={tipIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={tip}
                                                                    placeholder={`Dica ${tipIndex + 1}...`}
                                                                    onChange={(e) => handleTipChange(prompt.id, tipIndex, e.target.value)}
                                                                    className="flex-grow px-2 py-1 bg-white border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"
                                                                />
                                                                <button onClick={() => deleteTip(prompt.id, tipIndex)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addTip(prompt.id)} className="w-full mt-2 text-sm font-semibold text-pink-600 bg-pink-100 hover:bg-pink-200 rounded-md py-1.5">
                                                            + Adicionar Nova Dica
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Accordion>
                        ))}
                    </div>
                </Accordion>

                <Accordion title="Diretrizes e Persona da Assistente (Regras Gerais)">
                     <p className="text-sm text-gray-500 mb-3">Escreva as diretrizes da sua assistente ou use os botões abaixo para inserir dados do sistema. Você pode usar o botão "Refinar com IA" para organizar o texto.</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3 border-b border-gray-200 pb-3">
                        <span className="text-sm font-semibold text-gray-600 self-center mr-2">Inserir dados:</span>
                        <button onClick={() => handleInjectData(formatServicesForPrompt(services))} className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2">
                            <ClipboardListIcon className="w-4 h-4 text-gray-600" /> Serviços
                        </button>
                        <button onClick={() => handleInjectData(formatCustomersForPrompt(customers))} className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2">
                            <UsersIcon className="w-4 h-4 text-gray-600" /> Clientes
                        </button>
                        <button onClick={() => handleInjectData(formatSalonHoursForPrompt(salonHoursSettings))} className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-gray-600" /> Horário do Salão
                        </button>
                    </div>
                    <div className="border-b border-gray-200 pb-3 mb-3">
                        <h5 className="text-sm font-semibold text-gray-600 mb-2">Sempre incluir contexto (marcar)</h5>
                        <p className="text-xs text-gray-500 mb-3">Marque para que a IA sempre considere estas informações em suas respostas, sem adicioná-las ao texto da persona acima.</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Serviços</span>
                                <ToggleSwitch enabled={contextToggles.services} onChange={v => setContextToggles(p => ({...p, services: v}))} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Clientes</span>
                                <ToggleSwitch enabled={contextToggles.customers} onChange={v => setContextToggles(p => ({...p, customers: v}))} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Horário do Salão</span>
                                <ToggleSwitch enabled={contextToggles.salonHours} onChange={v => setContextToggles(p => ({...p, salonHours: v}))} />
                            </div>
                        </div>
                    </div>

                    <textarea 
                        ref={mainTextAreaRef}
                        value={localText}
                        onChange={(e) => setLocalText(e.target.value)}
                        rows={15}
                        className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-sm font-mono leading-relaxed focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Escreva a persona da sua IA aqui ou use os botões acima para começar..."
                    />
                     <div className="flex justify-center mt-4">
                        <button 
                            onClick={handleRefinePersona} 
                            disabled={isRefining || !localText.trim()}
                            className="px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isRefining ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Refinando...
                                </>
                            ) : "Organizar e Refinar com IA"}
                        </button>
                    </div>
                </Accordion>
            </div>

            <SaveBar hasChanges={hasPersonaChanges} onSave={handleSavePersona} onCancel={handleCancelPersona} />
        </div>
    );
};

export default AssistantPersonaManager;
