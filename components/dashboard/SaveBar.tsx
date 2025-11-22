

import React from 'react';

interface SaveBarProps {
    hasChanges: boolean;
    onSave: () => void;
    onCancel: () => void;
}

const SaveBar: React.FC<SaveBarProps> = ({ hasChanges, onSave, onCancel }) => {
    if (!hasChanges) return null;
    return (
         <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-40 animate-fade-in">
            <div className="max-w-7xl mx-auto p-4 flex justify-end items-center gap-4">
                <button onClick={onCancel} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={onSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors shadow-md hover:shadow-lg">Salvar Alterações</button>
            </div>
        </div>
    );
};

export default SaveBar;