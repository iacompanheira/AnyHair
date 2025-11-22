
import React from 'react';
import type { TitlePartSettings } from '../../types';
import { TrashIcon } from './Icons';


interface TitlePartEditorProps {
    part: TitlePartSettings;
    onChange: (newPart: TitlePartSettings) => void;
    onRemove: () => void;
    label: string;
}

const TitlePartEditor: React.FC<TitlePartEditorProps> = ({ part, onChange, onRemove, label }) => (
    <div className="space-y-4 p-4 bg-gray-50/50 rounded-lg border border-gray-200 relative">
         <div className="flex justify-between items-center">
            <h5 className="text-md font-semibold text-gray-600">{label}</h5>
            <button onClick={onRemove} className="p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors" aria-label="Remover Parte"><TrashIcon /></button>
        </div>
        <div>
            <label className="text-sm text-gray-700 mb-1 block">Texto</label>
            <input
                type="text"
                value={part.text}
                onChange={(e) => onChange({ ...part, text: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"
            />
        </div>
        <div>
            <label className="text-sm text-gray-700 mb-1 block">Cor</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={part.color}
                    onChange={(e) => onChange({ ...part, color: e.target.value })}
                    className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                    type="text"
                    value={part.color}
                    onChange={(e) => onChange({ ...part, color: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"
                    placeholder="#FFFFFF"
                />
            </div>
        </div>
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm text-gray-700">Tamanho da Fonte</label>
                <span className="font-semibold text-pink-500">{part.fontSize}px</span>
            </div>
            <input
                type="range"
                min="12"
                max="96"
                step="1"
                value={part.fontSize}
                onChange={(e) => onChange({ ...part, fontSize: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
        </div>
        <div>
            <label className="text-sm text-gray-700 mb-2 block">Estilo da Fonte</label>
            <div className="flex gap-2">
                <button
                    onClick={() => onChange({ ...part, fontWeight: part.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`px-4 py-2 text-sm rounded-md transition-all font-bold ${part.fontWeight === 'bold' ? 'bg-pink-500 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-pink-100'}`}
                >
                    B
                </button>
                <button
                    onClick={() => onChange({ ...part, fontStyle: part.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`px-4 py-2 text-sm rounded-md transition-all italic ${part.fontStyle === 'italic' ? 'bg-pink-500 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-pink-100'}`}
                >
                    I
                </button>
            </div>
        </div>
    </div>
);

export default TitlePartEditor;
