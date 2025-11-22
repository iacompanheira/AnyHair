// components/dashboard/calendar/utils.ts
import type { AppointmentStatus } from '../../../types';

export const getStatusColorClass = (status: AppointmentStatus) => {
    switch (status) {
        case 'Agendado':
            return {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-500',
            };
        case 'Concluído':
            return {
                bg: 'bg-green-100',
                text: 'text-green-800',
                border: 'border-green-500',
            };
        case 'Cancelado':
            return {
                bg: 'bg-red-100',
                text: 'text-red-800',
                border: 'border-red-500',
            };
        case 'Não Compareceu':
            return {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                border: 'border-yellow-500',
            };
        default:
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                border: 'border-gray-500',
            };
    }
};
