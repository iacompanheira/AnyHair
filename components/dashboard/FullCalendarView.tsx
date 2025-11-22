// components/dashboard/FullCalendarView.tsx
import React, { useState, useMemo } from 'react';
import type { Appointment, Employee } from '../../types';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, PrintIcon, FilePdfIcon, FileCsvIcon } from './Icons';
import DayAppointmentsModal from './calendar/DayAppointmentsModal';
import { getStatusColorClass } from './calendar/utils';
import { toYYYYMMDD } from '../../utils/date';

interface FullCalendarViewProps {
    appointments: Appointment[];
    employees: Employee[];
    onBack: () => void;
}

const FullCalendarView: React.FC<FullCalendarViewProps> = ({ appointments, employees, onBack }) => {
    const [displayDate, setDisplayDate] = useState(new Date());
    const [professionalFilter, setProfessionalFilter] = useState('all');
    const [selectedDay, setSelectedDay] = useState<{ date: Date; appointments: Appointment[] } | null>(null);

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        const filteredAppointments = appointments.filter(a => professionalFilter === 'all' || a.professional === professionalFilter);

        for (const apt of filteredAppointments) {
            const dateStr = toYYYYMMDD(new Date(apt.date)); // Ensure UTC date string
            if (!map.has(dateStr)) {
                map.set(dateStr, []);
            }
            map.get(dateStr)!.push(apt);
        }
        
        // Sort appointments within each day
        for (const dayAppointments of map.values()) {
            dayAppointments.sort((a, b) => a.time.localeCompare(b.time));
        }

        return map;
    }, [appointments, professionalFilter]);

    const changeMonth = (offset: number) => {
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const goToToday = () => setDisplayDate(new Date());

    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // Sunday - 0, ...
    const todayStr = toYYYYMMDD(new Date());

    const calendarGrid = useMemo(() => {
        const grid: (Date | null)[] = [];
        // Add empty cells for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(null);
        }
        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            grid.push(new Date(Date.UTC(year, month, day)));
        }
        return grid;
    }, [year, month, daysInMonth, firstDayOfMonth]);

    return (
        <>
            {selectedDay && <DayAppointmentsModal date={selectedDay.date} appointments={selectedDay.appointments} employees={employees} onClose={() => setSelectedDay(null)} />}
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full text-gray-800 print-container">
                <header className="flex items-center mb-6 flex-shrink-0 print-hidden">
                    <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                    <h3 className="text-2xl font-light tracking-wider">Calendário Completo</h3>
                </header>
                
                <div className="flex flex-wrap gap-4 justify-between items-center bg-white/80 border border-gray-200 rounded-xl p-3 mb-4 shadow-sm print-hidden">
                    <div className="flex items-center gap-2">
                        <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold border rounded-md hover:bg-gray-100">Hoje</button>
                        <button onClick={() => changeMonth(-1)} className="p-2 border rounded-md hover:bg-gray-100"><ChevronLeftIcon/></button>
                        <button onClick={() => changeMonth(1)} className="p-2 border rounded-md hover:bg-gray-100"><ChevronRightIcon/></button>
                        <span className="text-lg font-semibold">{displayDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <select value={professionalFilter} onChange={e => setProfessionalFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                            <option value="all">Todos os Profissionais</option>
                            {employees.filter(e=>e.accessLevel === 'Profissional').map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                             <button onClick={() => window.print()} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" title="Imprimir"><PrintIcon /></button>
                             <button onClick={() => alert("Exportar PDF")} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" title="Exportar PDF"><FilePdfIcon /></button>
                             <button onClick={() => alert("Exportar CSV")} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" title="Exportar CSV"><FileCsvIcon /></button>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 pb-4 calendar-grid-container">
                    <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 grid-rows-5 gap-1 h-full">
                        {calendarGrid.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`} className="bg-gray-50/50 rounded-md"></div>;

                            const dateStr = toYYYYMMDD(day);
                            const dayAppointments = appointmentsByDate.get(dateStr) || [];

                            return (
                                <div 
                                    key={dateStr} 
                                    onClick={() => setSelectedDay({ date: day, appointments: dayAppointments })}
                                    className="bg-white border border-gray-200 rounded-md p-2 flex flex-col cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <span className={`self-end font-medium ${dateStr === todayStr ? 'bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700'}`}>
                                        {day.getUTCDate()}
                                    </span>
                                    <div className="flex-grow overflow-y-auto mt-1 space-y-1">
                                        {dayAppointments.slice(0, 2).map(apt => {
                                            const statusColor = getStatusColorClass(apt.status);
                                            return (
                                                <div key={apt.id} className={`text-xs p-1 rounded ${statusColor.bg} ${statusColor.text} truncate`}>
                                                    <span className="font-bold">{apt.time}</span> {apt.customerName}
                                                </div>
                                            );
                                        })}
                                        {dayAppointments.length > 2 && (
                                            <div className="text-xs text-blue-600 font-semibold mt-1">
                                                + {dayAppointments.length - 2} agendamento{dayAppointments.length > 3 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FullCalendarView;