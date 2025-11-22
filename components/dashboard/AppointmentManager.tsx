
// components/dashboard/AppointmentManager.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Appointment, Customer, Service, AppointmentStatus, PaymentStatus, PaymentMethod } from '../../types';
import SaveBar from './SaveBar';
import {
    ArrowLeftIcon, CalendarIcon, ChevronDownIcon, PrintIcon, FilePdfIcon, FileCsvIcon,
    SpinnerIcon, DollarIcon, UsersIcon, CloseIcon, InfoIcon, ClipboardListIcon, UserIcon
} from './Icons';
import { toYYYYMMDD, fromYYYYMMDD, getDaysInMonth, getMonthName } from '../../utils/date';

// --- PROPS INTERFACE ---
interface AppointmentManagerProps {
    appointments: Appointment[];
    onAppointmentsChange: (appointments: Appointment[]) => void;
    customers: Customer[];
    services: Service[];
    onBack: () => void;
}

// --- HELPER & SUB-COMPONENTS ---

const Accordion: React.FC<React.PropsWithChildren<{ title: string, initiallyOpen?: boolean }>> = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="bg-white/80 border border-gray-200 rounded-xl">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                <ChevronDownIcon className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 border-t border-gray-200 animate-fade-in">{children}</div>}
        </div>
    );
};

const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
    const styles = {
        'Agendado': 'bg-blue-100 text-blue-800',
        'Concluído': 'bg-green-100 text-green-800',
        'Cancelado': 'bg-red-100 text-red-800',
        'Não Compareceu': 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const PaymentStatusBadge: React.FC<{ status: PaymentStatus, method?: string }> = ({ status, method }) => {
    const styles = {
        'Pendente': 'bg-orange-100 text-orange-800',
        'Pago': 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}{method && ` (${method})`}</span>;
};

const DatePicker: React.FC<{ selectedDate: Date, onSelectDate: (date: Date) => void }> = ({ selectedDate, onSelectDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayDate, setDisplayDate] = useState(selectedDate);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const days = getDaysInMonth(displayDate.getFullYear(), displayDate.getMonth());
    const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1).getUTCDay();
    const todayStr = toYYYYMMDD(new Date());
    const selectedDateStr = toYYYYMMDD(selectedDate);

    return (
        <div className="relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <span className="font-semibold">{selectedDate.toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })}</span>
                <ChevronDownIcon />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1))}>&lt;</button>
                        <span className="font-semibold">{getMonthName(displayDate.getMonth())} {displayDate.getFullYear()}</span>
                        <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1))}>&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {days.map(day => {
                            const dateStr = toYYYYMMDD(day);
                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => { onSelectDate(day); setIsOpen(false); }}
                                    className={`p-1.5 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400
                                    ${dateStr === selectedDateStr ? 'bg-pink-500 text-white' : ''}
                                    ${dateStr !== selectedDateStr && 'hover:bg-gray-200'}
                                    ${dateStr !== selectedDateStr && dateStr === todayStr ? 'border border-pink-500' : ''}`}
                                >
                                    {day.getUTCDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

interface AppointmentItemProps {
    apt: Appointment;
    updatingId: string | null;
    onUpdate: (id: string, updates: Partial<Appointment>) => void;
    onSetPaymentModal: (apt: Appointment) => void;
    onSetDetailsModal: (apt: Appointment) => void;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ apt, updatingId, onUpdate, onSetPaymentModal, onSetDetailsModal }) => (
    <li className={`relative transition-colors hover:bg-gray-50/80 ${apt.status === 'Cancelado' || apt.status === 'Não Compareceu' ? 'opacity-60' : ''}`}>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 p-4 cursor-pointer" onClick={() => onSetDetailsModal(apt)}>
            
            {/* Time Column */}
            <div className="font-bold text-lg text-pink-600 w-16 text-center">{apt.time}</div>

            {/* Details Column */}
            <div>
                <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-gray-800 text-base">{apt.customerName}</p>
                    <p className="text-sm text-gray-500">{apt.phone}</p>
                </div>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <ClipboardListIcon className="w-4 h-4 text-gray-400" /> 
                        {apt.serviceName}
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <UserIcon className="w-4 h-4 text-gray-400" /> 
                        {apt.professional}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <StatusBadge status={apt.status} />
                    <PaymentStatusBadge status={apt.paymentStatus} method={apt.paymentMethod} />
                </div>
            </div>

            {/* Actions Column */}
            <div className="flex flex-col gap-1.5 items-stretch justify-center w-24" onClick={e => e.stopPropagation()}>
                {updatingId === apt.id ? <div className="flex justify-center items-center h-full"><SpinnerIcon className="text-pink-500" /></div> : (
                    <>
                        {apt.status === 'Agendado' && <>
                            <button onClick={() => onSetPaymentModal(apt)} className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded-md hover:bg-green-600">Concluir</button>
                            <button onClick={() => onUpdate(apt.id, {status: 'Não Compareceu'})} className="px-2 py-1 text-xs font-semibold bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Faltou</button>
                            <button onClick={() => onUpdate(apt.id, {status: 'Cancelado'})} className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-md hover:bg-red-600">Cancelar</button>
                        </>}
                        {(apt.status === 'Concluído' || apt.status === 'Cancelado' || apt.status === 'Não Compareceu') &&
                                <button onClick={() => onUpdate(apt.id, {status: 'Agendado', paymentStatus: 'Pendente', paymentMethod: undefined})} className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Reverter</button>
                        }
                        {apt.status === 'Concluído' && apt.paymentStatus === 'Pendente' &&
                                <button onClick={() => onSetPaymentModal(apt)} className="px-2 py-1 text-xs font-semibold bg-gray-500 text-white rounded-md hover:bg-gray-600">Reg. Pagamento</button>
                        }
                    </>
                )}
            </div>
        </div>
    </li>
);


// --- MAIN COMPONENT ---
const AppointmentManager: React.FC<AppointmentManagerProps> = ({ appointments: initialAppointments, onAppointmentsChange, customers, services, onBack }) => {
    const [localAppointments, setLocalAppointments] = useState(initialAppointments);
    const [hasChanges, setHasChanges] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filters, setFilters] = useState({ customerName: '', status: 'all' });
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [paymentModalApt, setPaymentModalApt] = useState<Appointment | null>(null);
    const [detailsModalApt, setDetailsModalApt] = useState<Appointment | null>(null);

    useEffect(() => {
        setHasChanges(JSON.stringify(localAppointments) !== JSON.stringify(initialAppointments));
    }, [localAppointments, initialAppointments]);

    const handleBack = () => {
        if (hasChanges && !window.confirm("Você tem alterações não salvas. Deseja descartá-las?")) return;
        onBack();
    };

    const handleSaveChanges = () => {
        onAppointmentsChange(localAppointments);
        setHasChanges(false);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const changeDate = (offset: number) => {
        if(offset === 0) {
            setSelectedDate(new Date());
        } else {
            const newDate = new Date(selectedDate);
            newDate.setUTCDate(selectedDate.getUTCDate() + offset);
            setSelectedDate(newDate);
        }
    };
    
    const updateAppointment = (id: string, updates: Partial<Appointment>) => {
        setUpdatingId(id);
        // Simulate API call delay
        setTimeout(() => {
            setLocalAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt));
            setUpdatingId(null);
        }, 500);
    };
    
    const handlePayment = (method: PaymentMethod) => {
        if (!paymentModalApt) return;
        updateAppointment(paymentModalApt.id, { status: 'Concluído', paymentStatus: 'Pago', paymentMethod: method });
        setPaymentModalApt(null);
    };


    const filteredAppointments = useMemo(() => {
        const selectedDateStr = toYYYYMMDD(selectedDate);
        return localAppointments
            .filter(apt => apt.date === selectedDateStr)
            .filter(apt => apt.customerName.toLowerCase().includes(filters.customerName.toLowerCase()))
            .filter(apt => filters.status === 'all' || apt.status === apt.status)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [localAppointments, selectedDate, filters]);

    const scheduled = useMemo(() => filteredAppointments.filter(a => a.status === 'Agendado'), [filteredAppointments]);
    const completed = useMemo(() => filteredAppointments.filter(a => a.status === 'Concluído'), [filteredAppointments]);
    const others = useMemo(() => filteredAppointments.filter(a => !['Agendado', 'Concluído'].includes(a.status)), [filteredAppointments]);


    const daySummary = useMemo(() => {
        const now = new Date();
        const isToday = toYYYYMMDD(selectedDate) === toYYYYMMDD(now);
        const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
        const todaysAppointments = localAppointments.filter(a => a.date === toYYYYMMDD(selectedDate));
    
        // If viewing today, only consider appointments that have passed. Otherwise, consider all.
        const pastOrCurrentAppointments = isToday
            ? todaysAppointments.filter(a => a.time <= currentTimeString)
            : todaysAppointments;
    
        return {
            faturamento: pastOrCurrentAppointments
                .filter(a => a.status === 'Concluído' && a.paymentStatus === 'Pago')
                .reduce((sum, a) => sum + a.price, 0),
            
            // "Agendados" should always show the total for the selected day, as it's a forward-looking metric.
            agendados: todaysAppointments.filter(a => a.status === 'Agendado').length,
            
            concluidos: pastOrCurrentAppointments.filter(a => a.status === 'Concluído').length,
            cancelados: pastOrCurrentAppointments.filter(a => a.status === 'Cancelado').length,
            faltas: pastOrCurrentAppointments.filter(a => a.status === 'Não Compareceu').length,
        };
    }, [localAppointments, selectedDate]);


    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800">
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={handleBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Gerenciar Agendamentos</h3>
            </header>

            <div className="flex-grow overflow-y-auto pr-2 pb-24 space-y-4">
                <Accordion title="Filtros e Ações de Exportação" initiallyOpen>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div className="lg:col-span-2">
                             <label className="text-sm font-medium text-gray-600 mb-1 block">Data</label>
                             <div className="flex gap-2">
                                <button onClick={() => changeDate(-1)} className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">&lt;</button>
                                <button onClick={() => changeDate(0)} className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Hoje</button>
                                <button onClick={() => changeDate(1)} className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">&gt;</button>
                                <DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                             </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                             <button className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors" title="Imprimir"><PrintIcon /></button>
                             <button className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors" title="Exportar PDF"><FilePdfIcon /></button>
                             <button className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors" title="Exportar CSV"><FileCsvIcon /></button>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Filtrar por Cliente</label>
                            <input type="text" name="customerName" value={filters.customerName} onChange={handleFilterChange} placeholder="Nome do cliente..." className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Filtrar por Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500">
                                <option value="all">Todos os Status</option>
                                <option value="Agendado">Agendado</option>
                                <option value="Concluído">Concluído</option>
                                <option value="Cancelado">Cancelado</option>
                                <option value="Não Compareceu">Não Compareceu</option>
                            </select>
                        </div>
                    </div>
                </Accordion>
                <Accordion title="Resumo do Dia" initiallyOpen>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-gray-500">Faturamento Realizado</p>
                            <p className="text-2xl font-bold text-green-500">R$ {daySummary.faturamento.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-gray-500">Agendados</p>
                            <p className="text-2xl font-bold text-blue-500">{daySummary.agendados}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-gray-500">Serviços Concluídos</p>
                            <p className="text-2xl font-bold text-green-600">{daySummary.concluidos}</p>
                        </div>
                         <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-gray-500">Cancelados</p>
                            <p className="text-2xl font-bold text-red-500">{daySummary.cancelados}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-gray-500">Faltas</p>
                            <p className="text-2xl font-bold text-yellow-500">{daySummary.faltas}</p>
                        </div>
                    </div>
                </Accordion>
                 
                {filteredAppointments.length > 0 ? (
                    <div className="space-y-6">
                        {scheduled.length > 0 && (
                            <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                                <h4 className="p-4 text-md font-semibold text-gray-600 border-b bg-gray-50/50 rounded-t-xl">Próximos Agendamentos</h4>
                                <ul className="divide-y divide-gray-200">
                                    {scheduled.map(apt => (
                                        <AppointmentItem key={apt.id} apt={apt} updatingId={updatingId} onUpdate={updateAppointment} onSetPaymentModal={setPaymentModalApt} onSetDetailsModal={setDetailsModalApt} />
                                    ))}
                                </ul>
                            </div>
                        )}
                        {completed.length > 0 && (
                            <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                                <h4 className="p-4 text-md font-semibold text-gray-600 border-b bg-gray-50/50 rounded-t-xl">Serviços Concluídos</h4>
                                <ul className="divide-y divide-gray-200">
                                    {completed.map(apt => (
                                        <AppointmentItem key={apt.id} apt={apt} updatingId={updatingId} onUpdate={updateAppointment} onSetPaymentModal={setPaymentModalApt} onSetDetailsModal={setDetailsModalApt} />
                                    ))}
                                </ul>
                            </div>
                        )}
                        {others.length > 0 && (
                            <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm opacity-80">
                                <h4 className="p-4 text-md font-semibold text-gray-600 border-b bg-gray-50/50 rounded-t-xl">Outros (Cancelados/Faltas)</h4>
                                <ul className="divide-y divide-gray-200">
                                    {others.map(apt => (
                                        <AppointmentItem key={apt.id} apt={apt} updatingId={updatingId} onUpdate={updateAppointment} onSetPaymentModal={setPaymentModalApt} onSetDetailsModal={setDetailsModalApt} />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                        <p className="p-8 text-center text-gray-500">Nenhum agendamento encontrado para esta data e filtros.</p>
                    </div>
                )}
            </div>
            
            {/* --- MODALS --- */}
            {paymentModalApt && (
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPaymentModalApt(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Registrar Pagamento</h3>
                            <p className="text-sm text-gray-500">{paymentModalApt.serviceName} - R$ {paymentModalApt.price.toFixed(2)}</p>
                        </header>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            {(['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'] as PaymentMethod[]).map(method => 
                                <button key={method} onClick={() => handlePayment(method)} className="py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-pink-500 hover:text-white transition-colors">{method}</button>
                            )}
                        </div>
                        <footer className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end">
                            <button onClick={() => { updateAppointment(paymentModalApt.id, {status: 'Concluído', paymentStatus: 'Pendente'}); setPaymentModalApt(null); }} className="text-sm text-gray-600 hover:underline">Registrar Depois</button>
                        </footer>
                    </div>
                </div>
            )}
             {detailsModalApt && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setDetailsModalApt(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Detalhes do Agendamento</h3>
                            <button onClick={() => setDetailsModalApt(null)} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                        </header>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3"><UsersIcon className="w-5 h-5 text-gray-500 mt-1" /><p><strong>Cliente:</strong> {detailsModalApt.customerName}<br/><span className="text-sm text-gray-600">{detailsModalApt.phone}</span></p></div>
                            <div className="flex items-start gap-3"><ClipboardListIcon className="w-5 h-5 text-gray-500 mt-1" /><p><strong>Serviço:</strong> {detailsModalApt.serviceName} - {detailsModalApt.professional}</p></div>
                            <div className="flex items-start gap-3"><CalendarIcon className="w-5 h-5 text-gray-500 mt-1" /><p><strong>Data:</strong> {fromYYYYMMDD(detailsModalApt.date).toLocaleDateString('pt-BR', {timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'})} às {detailsModalApt.time}</p></div>
                            <div className="flex items-start gap-3"><InfoIcon className="w-5 h-5 text-gray-500 mt-1" /><p><strong>Status:</strong> <StatusBadge status={detailsModalApt.status} /></p></div>
                            <div className="flex items-start gap-3"><DollarIcon className="w-5 h-5 text-gray-500 mt-1" /><p><strong>Pagamento:</strong> <PaymentStatusBadge status={detailsModalApt.paymentStatus} method={detailsModalApt.paymentMethod} /></p></div>
                        </div>
                         <footer className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end gap-3">
                            <button onClick={() => setDetailsModalApt(null)} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Fechar</button>
                        </footer>
                    </div>
                </div>
            )}
            
            <SaveBar hasChanges={hasChanges} onSave={handleSaveChanges} onCancel={() => setLocalAppointments(initialAppointments)} />
        </div>
    );
};

export default AppointmentManager;
