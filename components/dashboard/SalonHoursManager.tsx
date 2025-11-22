import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { SalonHoursSettings, DayHours, StandardHours, ExceptionDate } from '../../types';
import SaveBar from './SaveBar';
import DayHoursEditor from './DayHoursEditor';
import SpecialDateModal from './SpecialDateModal';
import ToggleSwitch from './ToggleSwitch';
import { ArrowLeftIcon, CalendarIcon, ChevronDownIcon, ClockIcon, InfoIcon, PlusIcon, TrashIcon } from './Icons';
import { getDaysInMonth, getMonthName, toYYYYMMDD, fromYYYYMMDD, formatFullDate } from '../../utils/date';

interface SalonHoursManagerProps {
    settings: SalonHoursSettings;
    onSettingsChange: (settings: SalonHoursSettings) => void;
    onBack: () => void;
}

const AccordionSection: React.FC<React.PropsWithChildren<{ title: string, icon: React.ReactNode }>> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white/80 border border-gray-200 rounded-xl">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                </div>
                <ChevronDownIcon className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 border-t border-gray-200">{children}</div>}
        </div>
    );
};

const dayOrder: (keyof StandardHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels: Record<keyof StandardHours, string> = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

const SalonHoursManager: React.FC<SalonHoursManagerProps> = ({ settings: initialSettings, onSettingsChange, onBack }) => {
    const [draft, setDraft] = useState(initialSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const lastSelectedDateRef = useRef<string | null>(null);

    // Calendar state
    const [displayDate, setDisplayDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialData, setModalInitialData] = useState<Partial<ExceptionDate>>();

    // Copy-paste state
    const [copySource, setCopySource] = useState<{ key: keyof StandardHours, data: DayHours } | null>(null);

    useEffect(() => {
        setHasChanges(JSON.stringify(draft) !== JSON.stringify(initialSettings));
    }, [draft, initialSettings]);

    const handleBackWithCheck = () => {
        if (hasChanges && !window.confirm("Você tem alterações não salvas. Deseja descartá-las?")) {
            return;
        }
        onBack();
    };

    const handleSave = () => {
        onSettingsChange(draft);
        setHasChanges(false);
    };

    const handleCancel = () => {
        setDraft(initialSettings);
    };

    const handleStandardHoursChange = (key: keyof StandardHours, newDayHours: DayHours) => {
        setDraft(prev => ({ ...prev, standardHours: { ...prev.standardHours, [key]: newDayHours } }));
    };

    const handleGeneralChange = (key: keyof SalonHoursSettings['general'], value: any) => {
        setDraft(prev => ({ ...prev, general: { ...prev.general, [key]: value } }));
    };

    // Calendar logic
    const handleDateSelect = (dateStr: string, e: React.MouseEvent) => {
        if (e.shiftKey && lastSelectedDateRef.current) {
            const start = fromYYYYMMDD(lastSelectedDateRef.current);
            const end = fromYYYYMMDD(dateStr);
            const range: string[] = [];
            for (let d = new Date(Math.min(start.getTime(), end.getTime())); d.getTime() <= Math.max(start.getTime(), end.getTime()); d.setDate(d.getDate() + 1)) {
                range.push(toYYYYMMDD(new Date(d)));
            }
            setSelectedDates(Array.from(new Set([...selectedDates, ...range])));
        } else if (e.ctrlKey || e.metaKey) {
            setSelectedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
        } else {
            setSelectedDates([dateStr]);
        }
        lastSelectedDateRef.current = dateStr;
    };
    
    const handleOpenModal = (initialData?: Partial<ExceptionDate>) => {
        if (selectedDates.length === 0) return;
        setModalInitialData(initialData);
        setIsModalOpen(true);
    };

    const handleAddSuggestedHoliday = (holiday: { name: string, date: string }) => {
        setSelectedDates([holiday.date]);
        setModalInitialData({ name: holiday.name, type: 'closed' });
        setIsModalOpen(true);
    };

    const handleSaveException = (exceptionsData: Omit<ExceptionDate, 'date'>[]) => {
        const newExceptions = selectedDates.map(date => ({ ...exceptionsData[0], date }));
        setDraft(prev => ({
            ...prev,
            exceptions: [
                ...prev.exceptions.filter(ex => !selectedDates.includes(ex.date)),
                ...newExceptions
            ]
        }));
        setIsModalOpen(false);
        setSelectedDates([]);
    };
    
    const handleRemoveException = (date: string) => {
        setDraft(prev => ({ ...prev, exceptions: prev.exceptions.filter(ex => ex.date !== date) }));
    };
    
    const suggestedHolidays = useMemo(() => {
        const year = displayDate.getFullYear();
        return [
            { name: 'Ano Novo', date: `${year}-01-01` },
            { name: 'Carnaval', date: `${year}-02-12` },
            { name: 'Sexta-feira Santa', date: `${year}-03-29` },
            { name: 'Tiradentes', date: `${year}-04-21` },
            { name: 'Dia do Trabalho', date: `${year}-05-01` },
            { name: 'Corpus Christi', date: `${year}-05-30` },
            { name: 'Independência', date: `${year}-09-07` },
            { name: 'Nossa Sr.a Aparecida', date: `${year}-10-12` },
            { name: 'Finados', date: `${year}-11-02` },
            { name: 'Proclamação da República', date: `${year}-11-15` },
            { name: 'Natal', date: `${year}-12-25` },
        ].filter(h => !draft.exceptions.some(ex => ex.date === h.date));
    }, [displayDate, draft.exceptions]);

    // Copy-paste logic
    const handlePaste = (target: keyof StandardHours) => {
        if (copySource) {
            handleStandardHoursChange(target, copySource.data);
            setCopySource(null);
        }
    };
    
    const renderCalendar = () => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const days = getDaysInMonth(year, month);
        const firstDayOfMonth = days[0].getDay();
        const exceptionsMap = new Map<string, ExceptionDate>(draft.exceptions.map(ex => [ex.date, ex]));

        return (
            <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setDisplayDate(new Date(year, month - 1, 1))}>&lt;</button>
                    <h4 className="font-semibold">{getMonthName(month)} {year}</h4>
                    <button onClick={() => setDisplayDate(new Date(year, month + 1, 1))}>&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                    {days.map(day => {
                        const dateStr = toYYYYMMDD(day);
                        const exception = exceptionsMap.get(dateStr);
                        const isSelected = selectedDates.includes(dateStr);
                        const today = toYYYYMMDD(new Date()) === dateStr;
                        return (
                            <button key={dateStr} onClick={(e) => handleDateSelect(dateStr, e)} 
                                className={`relative p-2 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1
                                ${isSelected ? 'bg-pink-500 text-white' : ''} 
                                ${!isSelected && 'hover:bg-gray-200'}
                                ${!isSelected && today ? 'font-bold text-pink-600' : ''}
                                `}>
                                {day.getDate()}
                                {exception && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${exception.type === 'closed' ? 'bg-red-500' : 'bg-green-500'}`}></span>}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800">
            {isModalOpen && <SpecialDateModal dates={selectedDates} onClose={() => setIsModalOpen(false)} onSave={handleSaveException} existingException={modalInitialData} />}
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={handleBackWithCheck} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Horário do Salão</h3>
            </header>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6 pb-24">
                <AccordionSection title="Horários Padrão" icon={<ClockIcon className="w-6 h-6 text-pink-500" />}>
                   <div className="space-y-4">
                       {dayOrder.map(dayKey => (
                           <DayHoursEditor
                                key={dayKey}
                                title={dayLabels[dayKey]}
                                dayHours={draft.standardHours[dayKey]}
                                onChange={d => handleStandardHoursChange(dayKey, d)}
                                onCopy={() => setCopySource({ key: dayKey, data: draft.standardHours[dayKey] })}
                            />
                       ))}
                   </div>
                </AccordionSection>
                <AccordionSection title="Exceções (Feriados e Datas Especiais)" icon={<CalendarIcon className="w-6 h-6 text-pink-500" />}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            {renderCalendar()}
                            <button onClick={() => handleOpenModal()} disabled={selectedDates.length === 0} className="w-full mt-4 px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <PlusIcon /> Adicionar Exceção para {selectedDates.length} dia{selectedDates.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Sugestões de Feriados</h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                    {suggestedHolidays.length > 0 ? suggestedHolidays.map(h => (
                                        <div key={h.date} className="flex justify-between items-center bg-gray-100 p-2 rounded-md text-sm">
                                            <span>{h.name} ({fromYYYYMMDD(h.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})})</span>
                                            <button onClick={() => handleAddSuggestedHoliday(h)} className="text-xs font-semibold text-pink-600 hover:underline">Adicionar</button>
                                        </div>
                                    )) : <p className="text-sm text-gray-500">Nenhuma sugestão para este ano.</p>}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Exceções Configuradas</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                     {[...draft.exceptions].sort((a,b) => a.date.localeCompare(b.date)).map(ex => (
                                        <div key={ex.date} className="flex justify-between items-center bg-white p-2 rounded-md border text-sm">
                                            <div>
                                                <p className="font-medium">{ex.name} <span className="text-gray-500">({formatFullDate(fromYYYYMMDD(ex.date))})</span></p>
                                                <p className={`text-xs ${ex.type === 'closed' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {ex.type === 'closed' ? 'Fechado' : `Aberto ${ex.opens}-${ex.closes}`}
                                                </p>
                                            </div>
                                            <button onClick={() => handleRemoveException(ex.date)}><TrashIcon/></button>
                                        </div>
                                    ))}
                                     {draft.exceptions.length === 0 && <p className="text-sm text-gray-500">Nenhuma exceção configurada.</p>}
                                </div>
                            </div>
                        </div>
                   </div>
                </AccordionSection>
                <AccordionSection title="Configurações Gerais" icon={<InfoIcon className="w-6 h-6 text-pink-500" />}>
                   <div className="space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-gray-600 mb-1">Antecedência mínima para agendar</label>
                           <select value={draft.general.bookingLeadTime} onChange={e => handleGeneralChange('bookingLeadTime', parseInt(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500">
                               <option value="1">1 hora</option>
                               <option value="2">2 horas</option>
                               <option value="4">4 horas</option>
                               <option value="24">24 horas</option>
                           </select>
                       </div>
                       <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-600">Enviar lembretes de agendamento</label>
                            <ToggleSwitch enabled={draft.general.enableReminders} onChange={v => handleGeneralChange('enableReminders', v)} />
                       </div>
                       {draft.general.enableReminders && (
                           <div>
                               <label className="block text-sm font-medium text-gray-600 mb-1">Quando enviar o lembrete</label>
                               <select value={draft.general.reminderTime} onChange={e => handleGeneralChange('reminderTime', parseInt(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500">
                                   <option value="2">2 horas antes</option>
                                   <option value="24">24 horas antes</option>
                                   <option value="48">48 horas antes</option>
                               </select>
                           </div>
                       )}
                   </div>
                </AccordionSection>
            </div>
            {copySource && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white rounded-lg shadow-lg p-3 flex items-center gap-2 animate-fade-in z-50">
                    <p className="text-sm flex-shrink-0">Copiar de <strong>{dayLabels[copySource.key]}</strong> para:</p>
                    <div className="flex items-center gap-1 flex-wrap">
                        {dayOrder.filter(day => day !== copySource.key).map(dayKey => (
                             <button key={dayKey} onClick={() => handlePaste(dayKey)} className="text-xs bg-gray-600 hover:bg-pink-500 px-2 py-1 rounded-md">{dayLabels[dayKey].substring(0,3)}</button>
                        ))}
                    </div>
                    <button onClick={() => setCopySource(null)} className="text-gray-400 hover:text-white pl-2">&times;</button>
                </div>
            )}
            <SaveBar hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default SalonHoursManager;