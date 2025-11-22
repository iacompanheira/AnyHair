// components/dashboard/reports/PeriodSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronDownIcon } from '../Icons';
import { toYYYYMMDD } from '../../../utils/date';

export interface Period {
    startDate: Date;
    endDate: Date;
    label: string;
}

interface PeriodSelectorProps {
    period: Period;
    onPeriodChange: (period: Period) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ period, onPeriodChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState<'quick' | 'custom'>('quick');
    const [customStart, setCustomStart] = useState(period.startDate);
    const [customEnd, setCustomEnd] = useState(period.endDate);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const setDateRange = (days: number | 'this_month', label: string) => {
        const endDate = new Date();
        const startDate = new Date();
        
        if (days === 'this_month') {
            startDate.setDate(1);
        } else {
            startDate.setDate(endDate.getDate() - days);
        }
        
        onPeriodChange({ startDate, endDate, label });
        setIsOpen(false);
    };

    const handleCustomApply = () => {
        onPeriodChange({ startDate: customStart, endDate: customEnd, label: 'Personalizado' });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                {period.label}
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                    <div className="flex border-b">
                        <button onClick={() => setTab('quick')} className={`flex-1 p-2 text-sm font-semibold ${tab === 'quick' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-500'}`}>Rápidos</button>
                        <button onClick={() => setTab('custom')} className={`flex-1 p-2 text-sm font-semibold ${tab === 'custom' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-500'}`}>Personalizado</button>
                    </div>
                    {tab === 'quick' ? (
                        <div className="p-2">
                           {[
                               { label: 'Hoje', days: 0 },
                               { label: 'Últimos 7 dias', days: 6 },
                               { label: 'Este Mês', days: 'this_month' as 'this_month' },
                               { label: 'Últimos 30 dias', days: 29 },
                               { label: 'Últimos 90 dias', days: 89 },
                           ].map(item => (
                               <button key={item.label} onClick={() => setDateRange(item.days, item.label)} className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100">{item.label}</button>
                           ))}
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500">De</label>
                                <input type="date" value={toYYYYMMDD(customStart)} onChange={e => setCustomStart(new Date(e.target.value))} className="w-full text-sm p-1.5 border border-gray-300 rounded-md"/>
                            </div>
                             <div>
                                <label className="text-xs font-medium text-gray-500">Até</label>
                                <input type="date" value={toYYYYMMDD(customEnd)} onChange={e => setCustomEnd(new Date(e.target.value))} className="w-full text-sm p-1.5 border border-gray-300 rounded-md"/>
                            </div>
                            <button onClick={handleCustomApply} className="w-full py-2 bg-pink-500 text-white font-semibold rounded-md hover:bg-pink-600">Aplicar</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PeriodSelector;
