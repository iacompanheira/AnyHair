
import React, { useState } from 'react';
import { CloseIcon } from './Icons';

interface AddBackgroundModalProps {
    onClose: () => void;
    onAddFromUrl: (url: string) => void;
    onUploadClick: () => void;
}

const AddBackgroundModal: React.FC<AddBackgroundModalProps> = ({ onClose, onAddFromUrl, onUploadClick }) => {
    const [url, setUrl] = useState('');

    const handleAdd = () => {
        if (url.trim()) {
            // Basic URL validation
            try {
                new URL(url);
                onAddFromUrl(url.trim());
            } catch (_) {
                alert("Por favor, insira uma URL válida.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Adicionar Imagem</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Colar URL da Imagem</label>
                        <div className="flex gap-2">
                           <input 
                                type="text" 
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://..."
                                className="flex-grow px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                           />
                           <button onClick={handleAdd} className="px-4 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">Adicionar</button>
                        </div>
                    </div>
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-400">OU</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <button onClick={onUploadClick} className="w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                        Carregar do Dispositivo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBackgroundModal;
