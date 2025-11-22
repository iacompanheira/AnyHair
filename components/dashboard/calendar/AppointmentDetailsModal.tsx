// components/dashboard/calendar/AppointmentDetailsModal.tsx
import React from 'react';
import type { Appointment } from '../../../types';
import { CloseIcon, UserIcon, ClipboardListIcon, CalendarIcon, DollarIcon, InfoIcon } from '../Icons';
import { getStatusColorClass } from './utils';

interface AppointmentDetailsModalProps {
    appointment: Appointment;
    onClose: () => void;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-6 h-6 text-pink-500 mt-1">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-gray-500">{label}</p>
            <div className="text-gray-800 font-medium">{value}</div>
        </div>
    </div>
);

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ appointment, onClose }) => {
    const statusColor = getStatusColorClass(appointment.status);
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Detalhes do Agendamento</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4">
                    <DetailItem icon={<UserIcon className="w-full h-full"/>} label="Cliente" value={<>{appointment.customerName} <span className="text-gray-500 font-normal">({appointment.phone})</span></>} />
                    <DetailItem icon={<ClipboardListIcon className="w-full h-full"/>} label="Serviço" value={`${appointment.serviceName} com ${appointment.professional}`} />
                    <DetailItem icon={<CalendarIcon className="w-full h-full"/>} label="Data e Hora" value={`${new Date(appointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })} às ${appointment.time}`} />
                    <DetailItem icon={<DollarIcon className="w-full h-full"/>} label="Preço e Pagamento" value={<>R$ {appointment.price.toFixed(2)} <span className="text-sm font-normal text-gray-600">({appointment.paymentStatus})</span></>} />
                    <DetailItem icon={<InfoIcon className="w-full h-full"/>} label="Status" value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>{appointment.status}</span>} />
                </div>
                <footer className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Fechar</button>
                </footer>
            </div>
        </div>
    );
};

export default AppointmentDetailsModal;
