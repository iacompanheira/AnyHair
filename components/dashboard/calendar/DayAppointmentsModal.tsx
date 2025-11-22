// components/dashboard/calendar/DayAppointmentsModal.tsx
import React, { useState, useMemo } from 'react';
import type { Appointment, Employee } from '../../../types';
import { CloseIcon, PrintIcon, FilePdfIcon, FileCsvIcon } from '../Icons';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import { getStatusColorClass } from './utils';

interface DayAppointmentsModalProps {
    date: Date;
    appointments: Appointment[];
    employees: Employee[];
    onClose: () => void;
}

const DayAppointmentsModal: React.FC<DayAppointmentsModalProps> = ({ date, appointments, employees, onClose }) => {
    const [professionalFilter, setProfessionalFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<'all' | Appointment['status']>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const professionalsOnThisDay = useMemo(() => {
        const professionalNames = new Set(appointments.map(a => a.professional));
        return employees.filter(e => professionalNames.has(e.name));
    }, [appointments, employees]);

    const filteredAppointments = useMemo(() => {
        return appointments
            .filter(a => professionalFilter === 'all' || a.professional === professionalFilter)
            .filter(a => statusFilter === 'all' || a.status === statusFilter)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [appointments, professionalFilter, statusFilter]);

    const statusCounts = useMemo(() => {
        return appointments.reduce((acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1;
            return acc;
        }, {} as Record<Appointment['status'], number>);
    }, [appointments]);

    const handlePrint = () => window.print();

    return (
        <>
            {selectedAppointment && <AppointmentDetailsModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl text-gray-800 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <header className="p-4 border-b border-gray-200 flex justify-between items-center print-hidden">
                        <div>
                            <h3 className="text-lg font-semibold">Agendamentos do Dia</h3>
                            <p className="text-gray-600">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                    </header>
                    <div className="p-4 border-b print-hidden">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="text-sm font-medium">Profissional</label>
                                <select value={professionalFilter} onChange={e => setProfessionalFilter(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                                    <option value="all">Todos</option>
                                    {professionalsOnThisDay.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="flex gap-1 bg-gray-200 p-1 rounded-lg mt-1">
                                    {(['all', 'Agendado', 'Concluído', 'Cancelado', 'Não Compareceu'] as const).map(status => {
                                        const count = status === 'all' ? appointments.length : (statusCounts[status as Appointment['status']] || 0);
                                        return (
                                            <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1 text-sm font-semibold rounded-md ${statusFilter === status ? 'bg-white shadow' : ''}`}>
                                                {status === 'all' ? 'Todos' : status} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {filteredAppointments.length > 0 ? (
                             <ul className="divide-y divide-gray-200">
                                {filteredAppointments.map(apt => {
                                    const statusColor = getStatusColorClass(apt.status);
                                    return (
                                        <li key={apt.id} onClick={() => setSelectedAppointment(apt)} className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-100 border-l-4 ${statusColor.border}`}>
                                            <div className="font-bold text-lg w-16 text-center">{apt.time}</div>
                                            <div className="flex-grow">
                                                <p className="font-semibold">{apt.customerName}</p>
                                                <p className="text-sm text-gray-500">{apt.serviceName}</p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>{apt.status}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-center py-16 text-gray-500">Nenhum agendamento encontrado para este dia com os filtros selecionados.</p>
                        )}
                    </div>
                    <footer className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end gap-3 print-hidden">
                        <button onClick={handlePrint} className="px-4 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 flex items-center gap-2"><PrintIcon/> Imprimir</button>
                        <button onClick={() => alert("Exportar PDF")} className="px-4 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 flex items-center gap-2"><FilePdfIcon/> PDF</button>
                        <button onClick={() => alert("Exportar CSV")} className="px-4 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 flex items-center gap-2"><FileCsvIcon/> CSV</button>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default DayAppointmentsModal;