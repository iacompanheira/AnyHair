// components/dashboard/reports/ClientDetailModal.tsx
import React, { useMemo } from 'react';
import type { Customer, Appointment } from '../../../types';
import { CloseIcon, UserIcon, PhoneIcon, MailIcon, CalendarIcon, DollarIcon, ClipboardListIcon } from '../Icons';

interface ClientDetailModalProps {
    customer: Customer;
    allAppointments: Appointment[];
    onClose: () => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ customer, allAppointments, onClose }) => {
    const customerHistory = useMemo(() => {
        return allAppointments
            .filter(a => a.customerId === customer.id)
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [customer, allAppointments]);

    const totalSpent = useMemo(() => {
        return customerHistory
            .filter(a => a.status === 'Concluído')
            .reduce((sum, a) => sum + a.price, 0);
    }, [customerHistory]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg text-gray-800 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <UserIcon className="w-8 h-8 text-pink-500" />
                        <div>
                            <h3 className="text-lg font-semibold">{customer.name}</h3>
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 grid grid-cols-2 gap-4 text-sm bg-gray-50">
                    <div className="flex items-center gap-2"><DollarIcon className="w-5 h-5 text-green-500"/> Gasto Total: <span className="font-bold">R$ {totalSpent.toFixed(2)}</span></div>
                    <div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-blue-500"/> Total de Visitas: <span className="font-bold">{customerHistory.length}</span></div>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                    <h4 className="font-semibold mb-2">Histórico de Agendamentos</h4>
                    <ul className="space-y-3">
                        {customerHistory.slice(0, 10).map(apt => (
                             <li key={apt.id} className="p-3 bg-gray-50 rounded-lg border">
                                <p className="font-semibold flex justify-between">
                                    <span>{apt.serviceName}</span>
                                    <span className={apt.status === 'Concluído' ? 'text-green-600' : 'text-gray-500'}>{apt.status}</span>
                                </p>
                                <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString('pt-BR', {timeZone: 'UTC', day: '2-digit', month: 'long', year:'numeric'})} - R$ {apt.price.toFixed(2)}</p>
                            </li>
                        ))}
                         {customerHistory.length === 0 && <p className="text-sm text-gray-500">Nenhum histórico encontrado.</p>}
                    </ul>
                </div>
                <footer className="p-4 bg-gray-50 border-t flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Fechar</button>
                </footer>
            </div>
        </div>
    );
};

export default ClientDetailModal;
