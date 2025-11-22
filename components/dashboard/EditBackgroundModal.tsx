
import React, { useState } from 'react';
import type { BackgroundSettings } from '../../types';
import { CloseIcon } from './Icons';

interface EditBackgroundModalProps {
    bg: BackgroundSettings;
    onSave: (newSettings: BackgroundSettings) => void;
    onClose: () => void;
}

const EditBackgroundModal: React.FC<EditBackgroundModalProps> = ({ bg, onSave, onClose }) => {
    const [zoom, setZoom] = useState(bg.zoom);
    const [position, setPosition] = useState(bg.position);
    
    const handleSave = () => {
        onSave({ ...bg, zoom, position });
        onClose();
    };

    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 50, y: 50 });
    }

    const handleNumberInputChange = (setter: (value: number) => void, min: number, max: number, value: string) => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            setter(Math.max(min, Math.min(max, num)));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Editar Imagem</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                        <img 
                            src={bg.url} 
                            alt="Preview" 
                            className="w-full h-full object-cover transition-transform duration-100" 
                            style={{ transform: `scale(${zoom})`, objectPosition: `${position.x}% ${position.y}%`}}
                        />
                    </div>
                    <div className="flex flex-col space-y-4 justify-center">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Zoom</label>
                            <div className="flex items-center gap-3">
                                <input type="range" min="1" max="2" step="0.01" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"/>
                                <input type="number" min="1" max="2" step="0.01" value={zoom.toFixed(2)} onChange={e => handleNumberInputChange(setZoom, 1, 2, e.target.value)} className="w-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"/>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Posição Horizontal</label>
                            <div className="flex items-center gap-3">
                                <input type="range" min="0" max="100" step="1" value={position.x} onChange={e => setPosition(p => ({...p, x: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"/>
                                <input type="number" min="0" max="100" step="1" value={position.x} onChange={e => handleNumberInputChange(val => setPosition(p => ({...p, x: val})), 0, 100, e.target.value)} className="w-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"/>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Posição Vertical</label>
                             <div className="flex items-center gap-3">
                                <input type="range" min="0" max="100" step="1" value={position.y} onChange={e => setPosition(p => ({...p, y: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"/>
                                <input type="number" min="0" max="100" step="1" value={position.y} onChange={e => handleNumberInputChange(val => setPosition(p => ({...p, y: val})), 0, 100, e.target.value)} className="w-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"/>
                             </div>
                        </div>
                    </div>
                </div>
                <footer className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-between items-center">
                    <button onClick={handleReset} className="px-4 py-2 text-sm text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Restaurar Padrão</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">Salvar</button>
                </footer>
            </div>
        </div>
    );
};

export default EditBackgroundModal;
