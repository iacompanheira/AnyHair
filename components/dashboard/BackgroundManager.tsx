

import React, { useState, useRef } from 'react';
import type { BackgroundSettings, OverlaySettings, TitleSettings, TitlePartSettings, HeaderSettings, CTAButtonSettings } from '../../types';
import EditBackgroundModal from './EditBackgroundModal';
import AddBackgroundModal from './AddBackgroundModal';
import TitlePartEditor from './TitlePartEditor';
import ToggleSwitch from './ToggleSwitch';
import VisualizerPreview from './VisualizerPreview';
import { ArrowLeftIcon, PlusIconLarge, EditIcon, TrashIcon, ChevronDownIcon, InfoIcon, MicIcon, SparklesIcon, DocumentTextIcon, ImageIcon } from './Icons';

const transitionStyles = {
    'fade': 'Fade', 'slide-up': 'Slide Up', 'slide-right': 'Slide Right',
    'zoom-in': 'Zoom In', 'zoom-out': 'Zoom Out', 'blur': 'Blur',
    'wipe-right': 'Wipe Right', 'circle-wipe': 'Circle Wipe', 'reveal-y': 'Reveal',
    'rotate-in': 'Rotate In',
};

type Settings = {
    backgrounds: BackgroundSettings[];
    isRotationEnabled: boolean;
    rotationInterval: number;
    transitionDuration: number;
    transitionStyle: string;
    visualizerStyle: number;
    overlaySettings: OverlaySettings;
    titleSettings: TitleSettings;
    headerSettings: HeaderSettings;
    micGain: number;
    isNoiseReductionEnabled: boolean;
    ctaSettings: CTAButtonSettings;
    cardOrder: string[];
}

interface BackgroundManagerProps {
    settings: Settings;
    onSettingsChange: (newSettings: Partial<Settings>) => void;
    onBack: () => void;
}

const AccordionSection: React.FC<React.PropsWithChildren<{ title: string, icon: React.ReactNode, initiallyOpen?: boolean }>> = ({ title, icon, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="bg-white/80 border border-gray-200 rounded-xl transition-shadow hover:shadow-md">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-md font-semibold text-gray-700">{title}</h3>
                </div>
                <ChevronDownIcon className={`transform transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
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


const BackgroundManager: React.FC<BackgroundManagerProps> = ({ settings, onSettingsChange, onBack }) => {
    const { 
        backgrounds, isRotationEnabled, rotationInterval, transitionDuration, 
        transitionStyle, visualizerStyle, overlaySettings, titleSettings, headerSettings,
        micGain, isNoiseReductionEnabled, ctaSettings
    } = settings;
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingBackground, setEditingBackground] = useState<BackgroundSettings | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newUrl = e.target?.result as string;
                const newBg: BackgroundSettings = { url: newUrl, zoom: 1, position: { x: 50, y: 50 } };
                onSettingsChange({ backgrounds: [...backgrounds, newBg] });
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };

    const handleAddFromUrl = (url: string) => {
        const newBg: BackgroundSettings = { url, zoom: 1, position: { x: 50, y: 50 } };
        onSettingsChange({ backgrounds: [...backgrounds, newBg] });
        setAddModalOpen(false);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
        setAddModalOpen(false);
    };

    const handleRemoveImage = (indexToRemove: number) => {
        onSettingsChange({ backgrounds: backgrounds.filter((_, index) => index !== indexToRemove) });
    };

    const handleSaveEdit = (newSettings: BackgroundSettings) => {
        const index = backgrounds.findIndex(bg => bg.url === newSettings.url);
        if (index !== -1) {
            const newBgs = [...backgrounds];
            newBgs[index] = newSettings;
            onSettingsChange({ backgrounds: newBgs });
        }
        setEditingBackground(null);
    };
    
    const handleTitlePartChange = (index: number, newPart: TitlePartSettings) => {
        const newParts = [...titleSettings.parts];
        newParts[index] = newPart;
        onSettingsChange({ titleSettings: { parts: newParts } });
    };
    
    const handleAddTitlePart = () => {
        const newPart: TitlePartSettings = { text: 'Novo', color: '#FFFFFF', fontSize: 24, fontWeight: 'normal', fontStyle: 'normal' };
        onSettingsChange({ titleSettings: { parts: [...titleSettings.parts, newPart] } });
    };

    const handleRemoveTitlePart = (index: number) => {
        if (titleSettings.parts.length > 1) {
            const newParts = titleSettings.parts.filter((_, i) => i !== index);
            onSettingsChange({ titleSettings: { parts: newParts } });
        }
    };

     const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newBackgrounds = [...backgrounds];
        const [reorderedItem] = newBackgrounds.splice(dragItem.current, 1);
        newBackgrounds.splice(dragOverItem.current, 0, reorderedItem);
        dragItem.current = null;
        dragOverItem.current = null;
        setDraggedIndex(null);
        onSettingsChange({ backgrounds: newBackgrounds });
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800">
            {editingBackground && <EditBackgroundModal bg={editingBackground} onSave={handleSaveEdit} onClose={() => setEditingBackground(null)} />}
            {isAddModalOpen && <AddBackgroundModal onAddFromUrl={handleAddFromUrl} onUploadClick={handleUploadClick} onClose={() => setAddModalOpen(false)} />}
            
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Planos de Fundo e Visual</h3>
            </header>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 pb-24">
                
                <AccordionSection title="Aparência Geral" icon={<ImageIcon className="w-5 h-5 text-pink-500" />} initiallyOpen>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center mb-2"><label className="text-sm font-semibold text-gray-700">Sobreposição de Cor</label><HelpTooltip text="Adiciona uma camada de cor semi-transparente sobre as imagens de fundo para melhorar a legibilidade do texto." /></div>
                            <div className="flex justify-between items-center mb-4"><label className="text-md text-gray-700">Ativar Sobreposição</label><ToggleSwitch enabled={overlaySettings.enabled} onChange={(enabled) => onSettingsChange({ overlaySettings: { ...overlaySettings, enabled } })}/></div>
                            <div className={`space-y-3 transition-opacity ${!overlaySettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div>
                                    <label className="text-sm text-gray-700 mb-2 block">Cor da Sobreposição</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={overlaySettings.color} onChange={(e) => onSettingsChange({ overlaySettings: { ...overlaySettings, color: e.target.value } })} className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md cursor-pointer"/>
                                        <input type="text" value={overlaySettings.color} onChange={(e) => onSettingsChange({ overlaySettings: { ...overlaySettings, color: e.target.value } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500" placeholder="#0D1117"/>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2"><label className="text-sm text-gray-700">Intensidade</label><span className="font-semibold text-pink-500">{Math.round(overlaySettings.opacity * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={overlaySettings.opacity} onChange={(e) => onSettingsChange({ overlaySettings: { ...overlaySettings, opacity: parseFloat(e.target.value) } })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionSection>

                <AccordionSection title="Barra Superior e Título" icon={<DocumentTextIcon className="w-5 h-5 text-pink-500 !mb-0" />}>
                     <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Cor de Fundo da Barra</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={headerSettings.backgroundColor} onChange={(e) => onSettingsChange({ headerSettings: { ...headerSettings, backgroundColor: e.target.value } })} className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md cursor-pointer"/>
                                <input type="text" value={headerSettings.backgroundColor} onChange={(e) => onSettingsChange({ headerSettings: { ...headerSettings, backgroundColor: e.target.value } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500" placeholder="#FFFFFF"/>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2"><label className="text-sm text-gray-700">Transparência da Barra</label><span className="font-semibold text-pink-500">{Math.round(headerSettings.opacity * 100)}%</span></div>
                            <input type="range" min="0" max="1" step="0.01" value={headerSettings.opacity} onChange={(e) => onSettingsChange({ headerSettings: { ...headerSettings, opacity: parseFloat(e.target.value) } })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"/>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2"><label className="text-sm text-gray-700">Altura da Barra</label><span className="font-semibold text-pink-500">{headerSettings.height}px</span></div>
                            <input type="range" min="40" max="120" step="1" value={headerSettings.height} onChange={(e) => onSettingsChange({ headerSettings: { ...headerSettings, height: parseInt(e.target.value, 10) } })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"/>
                        </div>
                         <div className="border-t pt-4 mt-4">
                             <h4 className="text-sm font-semibold text-gray-700 mb-2">Editor de Título</h4>
                            <div className="space-y-4">
                                {titleSettings.parts.map((part, index) => (
                                     <TitlePartEditor
                                        key={index}
                                        label={`Parte ${index + 1}`}
                                        part={part}
                                        onChange={(newPart) => handleTitlePartChange(index, newPart)}
                                        onRemove={() => handleRemoveTitlePart(index)}
                                    />
                                ))}
                            </div>
                            <button onClick={handleAddTitlePart} className="w-full mt-4 px-4 py-2 bg-pink-100 text-pink-700 font-semibold rounded-lg hover:bg-pink-200 transition-colors">Adicionar Parte</button>
                        </div>
                    </div>
                </AccordionSection>

                <AccordionSection title="Imagens de Fundo e Carrossel" icon={<ImageIcon className="w-5 h-5 text-pink-500" />}>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                        <div onClick={() => setAddModalOpen(true)} className="relative aspect-video rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center bg-gray-100/80 border-2 border-dashed border-gray-300 hover:border-pink-400">
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <PlusIconLarge />
                            <p className="text-gray-500 mt-2 text-sm">Adicionar Nova</p>
                        </div>
                        {backgrounds.map((bg, index) => (
                            <div 
                                key={bg.url + index} 
                                draggable
                                onDragStart={() => { dragItem.current = index; setDraggedIndex(index); }}
                                onDragEnter={() => (dragOverItem.current = index)}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                                className={`group relative aspect-video rounded-lg overflow-hidden ring-1 ring-gray-200 cursor-grab transition-opacity ${draggedIndex === index ? 'opacity-50' : ''}`}
                            >
                                <img src={bg.url} alt="Background option" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button onClick={() => setEditingBackground(bg)} className="p-2 bg-blue-600/80 text-white rounded-full hover:bg-blue-500 transition-colors" aria-label="Editar imagem"><EditIcon /></button>
                                    <button onClick={() => handleRemoveImage(index)} className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-500 transition-colors" aria-label="Remover imagem"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-md text-gray-700">Ativar Carrossel de Imagens</label>
                            <ToggleSwitch enabled={isRotationEnabled} onChange={(enabled) => onSettingsChange({ isRotationEnabled: enabled })} />
                        </div>
                        <div className={`space-y-3 transition-opacity ${!isRotationEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                             <div>
                                <div className="flex justify-between items-center mb-2"><label className="text-sm text-gray-700">Intervalo de Troca</label><HelpTooltip text="Tempo que cada imagem fica na tela antes de iniciar a transição para a próxima." /><span className="font-semibold text-pink-500">{rotationInterval / 1000}s</span></div>
                                <input type="range" min="2" max="30" value={rotationInterval / 1000} onChange={(e) => onSettingsChange({ rotationInterval: parseInt(e.target.value, 10) * 1000 })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2"><label className="text-sm text-gray-700">Duração da Transição</label><HelpTooltip text="Quanto tempo a animação de troca de imagem dura, do início ao fim." /><span className="font-semibold text-pink-500">{transitionDuration >= 1000 ? `${(transitionDuration / 1000).toFixed(1)}s` : `${transitionDuration}ms`}</span></div>
                                <input type="range" min="0" max="20000" step="100" value={transitionDuration} onChange={(e) => onSettingsChange({ transitionDuration: parseInt(e.target.value, 10) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                            </div>
                        </div>
                    </div>
                     <div className="border-t pt-4 mt-4">
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">Estilo da Transição</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{Object.entries(transitionStyles).map(([key, name]) => (<button key={key} onClick={() => onSettingsChange({ transitionStyle: key })} className={`px-2 py-2 text-sm rounded-md transition-all ${transitionStyle === key ? 'bg-pink-500 text-white font-semibold shadow' : 'bg-gray-200 text-gray-700 hover:bg-pink-100'}`}>{name}</button>))}</div>
                    </div>
                </AccordionSection>

                <AccordionSection title="Botão de Ação e Áudio" icon={<MicIcon className="w-5 h-5 text-pink-500" />}>
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold text-gray-700">Botão de Ação (CTA)</h4>
                            <ToggleSwitch enabled={ctaSettings.enabled} onChange={(enabled) => onSettingsChange({ ctaSettings: { ...ctaSettings, enabled } })}/>
                        </div>
                        <div className={`space-y-3 transition-opacity ${!ctaSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div>
                                <label className="text-sm text-gray-700 mb-1 block">Texto do Botão</label>
                                <input type="text" value={ctaSettings.buttonText} onChange={(e) => onSettingsChange({ ctaSettings: { ...ctaSettings, buttonText: e.target.value } })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"/>
                            </div>
                            <div>
                                 <div className="flex justify-between items-center mb-2"><label className="text-sm text-gray-700">Tamanho da Fonte</label><span className="font-semibold text-pink-500">{ctaSettings.fontSize}px</span></div>
                                <input type="range" min="12" max="32" step="1" value={ctaSettings.fontSize} onChange={(e) => onSettingsChange({ ctaSettings: { ...ctaSettings, fontSize: parseInt(e.target.value, 10) } })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"/>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-700 mb-2 block">Cor do Botão</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={ctaSettings.buttonColor} onChange={(e) => onSettingsChange({ ctaSettings: { ...ctaSettings, buttonColor: e.target.value } })} className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md cursor-pointer"/>
                                        <input type="text" value={ctaSettings.buttonColor} onChange={(e) => onSettingsChange({ ctaSettings: { ...ctaSettings, buttonColor: e.target.value } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm" placeholder="#EC4899"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 mb-2 block">Cor do Texto</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={ctaSettings.textColor} onChange={(e) => onSettingsChange({ ctaSettings: { ...ctaSettings, textColor: e.target.value } })} className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md cursor-pointer"/>
                                        <input type="text" value={ctaSettings.textColor} onChange={(e) => onSettingsChange({ ctaSettings: { ...ctaSettings, textColor: e.target.value } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm" placeholder="#FFFFFF"/>
                                    </div>
                                </div>
                             </div>
                        </div>
                         <div className="border-t pt-4 mt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center"><label className="text-sm font-semibold text-gray-700">Ativar Redução de Ruído</label><HelpTooltip text="Tenta reduzir ruídos de fundo durante a chamada. Pode afetar a qualidade da voz em alguns ambientes."/></div>
                                <ToggleSwitch enabled={isNoiseReductionEnabled} onChange={(enabled) => onSettingsChange({ isNoiseReductionEnabled: enabled })} />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2"><div className="flex items-center"><label className="text-sm text-gray-700">Ganho do Microfone</label><HelpTooltip text="Aumenta ou diminui a sensibilidade do microfone. Aumente se a IA tiver dificuldade de ouvir, diminua se o som estiver estourando."/></div><span className="font-semibold text-pink-500">{Math.round(micGain * 100)}%</span></div>
                                <input type="range" min="0" max="2" step="0.05" value={micGain} onChange={(e) => onSettingsChange({ micGain: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                            </div>
                        </div>
                    </div>
                </AccordionSection>

                 <AccordionSection title="Animação do Visualizador de Voz" icon={<SparklesIcon className="w-5 h-5 text-pink-500" />}>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                         <VisualizerPreview 
                            styleId={0} 
                            isSelected={visualizerStyle === 0} 
                            onClick={() => onSettingsChange({ visualizerStyle: 0 })}
                         />
                         {Array.from({ length: 10 }, (_, i) => i + 1).map(id => (
                             <VisualizerPreview 
                                key={id} 
                                styleId={id} 
                                isSelected={visualizerStyle === id} 
                                onClick={() => onSettingsChange({ visualizerStyle: id })}
                            />
                        ))}
                    </div>
                </AccordionSection>
            </div>
        </div>
    );
};

export default BackgroundManager;