import React from 'react';
import type { Appointment, Service } from '../types';
import { fromYYYYMMDD } from '../utils/date';
import { CloseIcon, CheckCircleIcon, ShareIcon, CalendarPlusIcon } from './Icons';

interface AppointmentConfirmationCardProps {
    appointment: Appointment;
    services: Service[];
    onClose: () => void;
}

const AppointmentConfirmationCard: React.FC<AppointmentConfirmationCardProps> = ({ appointment, services, onClose }) => {
    
    const service = services.find(s => s.id === appointment.serviceId);
    const duration = service?.duration || 60; // Default to 60 mins if not found

    const handleShare = async () => {
        const shareText = `Olá! Meu agendamento no AnyHair está confirmado:\n\nServiço: ${appointment.serviceName}\nData: ${fromYYYYMMDD(appointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long' })}\nHorário: ${appointment.time}\n\nAté lá!`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Agendamento Confirmado - AnyHair',
                    text: shareText,
                });
            } catch (error) {
                // Ignore AbortError which is thrown when the user cancels the share dialog.
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                     console.error('Erro ao compartilhar:', error);
                }
            }
        } else {
            // Fallback for desktop or browsers without Share API
            navigator.clipboard.writeText(shareText);
            alert('Detalhes do agendamento copiados para a área de transferência!');
        }
    };
    
    const handleSaveToCalendar = () => {
        const startDate = fromYYYYMMDD(appointment.date);
        const [hours, minutes] = appointment.time.split(':').map(Number);
        startDate.setUTCHours(hours, minutes);

        const endDate = new Date(startDate.getTime() + duration * 60000);

        const toICSDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        }

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `DTSTART:${toICSDate(startDate)}`,
            `DTEND:${toICSDate(endDate)}`,
            `SUMMARY:Agendamento: ${appointment.serviceName} no AnyHair`,
            `DESCRIPTION:Seu agendamento para ${appointment.serviceName} com ${appointment.professional} está confirmado.`,
            'LOCATION:Endereço do Salão AnyHair', // Replace with actual address if available
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'agendamento_anyhair.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-gray-800 text-white rounded-2xl shadow-2xl border border-pink-500/30 overflow-hidden transform transition-all animate-zoom-in">
                <div className="p-6 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Agendamento Confirmado!</h2>
                    <p className="text-gray-300 mt-1">Seu horário no AnyHair está garantido.</p>
                </div>

                <div className="bg-white/5 p-6 space-y-4 text-left">
                    <div className="border-l-4 border-pink-400 pl-4">
                        <p className="text-sm text-gray-400">Serviço</p>
                        <p className="font-semibold text-lg">{appointment.serviceName}</p>
                    </div>
                     <div className="border-l-4 border-pink-400 pl-4">
                        <p className="text-sm text-gray-400">Data e Horário</p>
                        <p className="font-semibold text-lg">{fromYYYYMMDD(appointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })} às {appointment.time}</p>
                    </div>
                     <div className="border-l-4 border-pink-400 pl-4">
                        <p className="text-sm text-gray-400">Profissional</p>
                        <p className="font-semibold text-lg">{appointment.professional}</p>
                    </div>
                </div>

                <div className="p-6 bg-gray-900/50">
                    <p className="text-center text-sm text-gray-300 mb-4">Você pode salvar no celular, clicando em compartilhar</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleSaveToCalendar} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                            <CalendarPlusIcon className="w-5 h-5" />
                            Salvar no Calendário
                        </button>
                        <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                            <ShareIcon className="w-5 h-5" />
                            Compartilhar
                        </button>
                    </div>
                </div>
                 <div className="p-3 bg-gray-900/50 text-center border-t border-white/10">
                    <button onClick={onClose} className="text-gray-400 hover:text-white font-semibold transition-colors">Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentConfirmationCard;