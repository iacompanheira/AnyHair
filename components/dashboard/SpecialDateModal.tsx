
import React, { useState } from 'react';
import type { ExceptionDate } from '../../types';
import { CloseIcon } from './Icons';

interface SpecialDateModalProps {
    dates: string[];
    onClose: () => void;
    onSave: (exceptions: Omit<ExceptionDate, 'date'>[]) => void;
    existingException?: Partial<ExceptionDate>;
}

const SpecialDateModal: React.FC<SpecialDateModalProps> = ({ dates, onClose, onSave, existingException }) => {
    const [type, setType] = useState<'closed' | 'special_hours'>(existingException?.type || 'closed');
    const [name, setName] = useState(existingException?.name || '');
    const [opens, setOpens] = useState(existingException?.opens || '09:00');
    const [closes, setCloses] = useState(existingException?.closes || '17:00');

    const handleSave = () => {
        if (!name.trim()) {
            alert("Por favor, dê um nome para a exceção (ex: Feriado de Natal).");
            return;
        }
        
        const exceptionData: Omit<ExceptionDate, 'date'> = {
            name,
            type,
            ...(type === 'special_hours' && { opens, closes }),
        };
        
        // This modal creates the "template" for the exception.
        // The parent component will apply this template to all selected dates.
        onSave([exceptionData]); 
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Configurar Exceção ({dates.length} dia{dates.length > 1 ? 's' : ''})</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nome da Exceção</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Feriado, Evento Especial" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Tipo de Horário</label>
                        <div className="flex gap-2">
                            <button onClick={() => setType('closed')} className={`flex-1 py-2 rounded-md transition-colors text-sm font-semibold ${type === 'closed' ? 'bg-pink-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Fechado</button>
                            <button onClick={() => setType('special_hours')} className={`flex-1 py-2 rounded-md transition-colors text-sm font-semibold ${type === 'special_hours' ? 'bg-pink-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Horário Especial</button>
                        </div>
                    </div>
                    {type === 'special_hours' && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4 animate-fade-in">
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Abre às</label>
                                <input type="time" value={opens} onChange={e => setOpens(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Fecha às</label>
                                <input type="time" value={closes} onChange={e => setCloses(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" />
                            </div>
                        </div>
                    )}
                </div>
                <footer className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">Salvar</button>
                </footer>
            </div>
        </div>
    );
};

export default SpecialDateModal;
