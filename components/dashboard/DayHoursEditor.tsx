
import React, { useState, useEffect } from 'react';
import type { DayHours } from '../../types';
import ToggleSwitch from './ToggleSwitch';
import { CopyIcon } from './Icons';

interface DayHoursEditorProps {
    title: string;
    dayHours: DayHours;
    onChange: (newDayHours: DayHours) => void;
    onCopy: () => void;
}

const DayHoursEditor: React.FC<DayHoursEditorProps> = ({ title, dayHours, onChange, onCopy }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let newError: string | null = null;
        if (dayHours.enabled) {
            if (dayHours.closes <= dayHours.opens) {
                newError = "O horário de fechamento deve ser após o de abertura.";
            } else if (dayHours.hasBreak) {
                if (!dayHours.breakStarts || !dayHours.breakEnds) {
                    newError = "Defina o início e o fim do intervalo.";
                } else if (dayHours.breakStarts < dayHours.opens || dayHours.breakEnds > dayHours.closes) {
                    newError = "O intervalo deve ocorrer durante o expediente.";
                } else if (dayHours.breakEnds <= dayHours.breakStarts) {
                    newError = "O fim do intervalo deve ser após o início.";
                }
            }
        }
        setError(newError);
    }, [dayHours]);

    const handleTimeChange = (field: 'opens' | 'closes' | 'breakStarts', value: string) => {
        const newHours = { ...dayHours, [field]: value };
        // Auto-calculate 1h break
        if (field === 'breakStarts') {
            const [h, m] = value.split(':').map(Number);
            const breakEnd = new Date(0, 0, 0, h + 1, m);
            const endH = String(breakEnd.getHours()).padStart(2, '0');
            const endM = String(breakEnd.getMinutes()).padStart(2, '0');
            newHours.breakEnds = `${endH}:${endM}`;
        }
        onChange(newHours);
    };

    const statusText = dayHours.enabled ? `${dayHours.opens} - ${dayHours.closes}` : "Fechado";

    return (
        <div className={`bg-white/80 border rounded-xl p-4 transition-all duration-300 ${error ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-semibold text-gray-700">{title}</h4>
                    {!isExpanded && <p className="text-sm text-gray-500">{statusText}</p>}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onCopy} className="p-2 text-gray-400 hover:text-pink-500" title="Copiar horário"><CopyIcon className="w-5 h-5" /></button>
                    <ToggleSwitch enabled={dayHours.enabled} onChange={(enabled) => onChange({ ...dayHours, enabled })} />
                </div>
            </div>

            {dayHours.enabled && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Abre às</label>
                            <input type="time" value={dayHours.opens} onChange={(e) => handleTimeChange('opens', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Fecha às</label>
                            <input type="time" value={dayHours.closes} onChange={(e) => handleTimeChange('closes', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-600">Intervalo de almoço</label>
                            <ToggleSwitch enabled={dayHours.hasBreak} onChange={(hasBreak) => onChange({ ...dayHours, hasBreak })} />
                        </div>
                        {dayHours.hasBreak && (
                             <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">Início</label>
                                    <input type="time" value={dayHours.breakStarts || ''} onChange={(e) => handleTimeChange('breakStarts', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">Fim (automático)</label>
                                    <input type="time" value={dayHours.breakEnds || ''} disabled className="w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed" />
                                </div>
                            </div>
                        )}
                    </div>
                    {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default DayHoursEditor;
