// hooks/useReportData.ts
import { useMemo } from 'react';
import type { Appointment, Customer, Employee } from '../types';
import { fromYYYYMMDD } from '../utils/date';

export interface Period {
    startDate: Date;
    endDate: Date;
    label: string;
}

export interface ReportMetrics {
    faturamento: number;
    ticketMedio: number;
    taxaComparecimento: number;
    novosClientes: number;
    totalAgendamentos: number;
    agendamentosConcluidos: number;
    clientesRecorrentes: number;
}

const calculateMetrics = (
    periodAppointments: Appointment[],
    allAppointments: Appointment[],
    customerFirstAppointmentMap: Map<string, string>,
    period: Period
): ReportMetrics => {
    const completed = periodAppointments.filter(a => a.status === 'Concluído');
    const noShows = periodAppointments.filter(a => a.status === 'Não Compareceu');

    const agendamentosConcluidos = completed.length;
    const totalAgendamentos = periodAppointments.length;

    const faturamento = completed.reduce((sum, a) => sum + a.price, 0);
    const ticketMedio = agendamentosConcluidos > 0 ? faturamento / agendamentosConcluidos : 0;
    const taxaComparecimento = (agendamentosConcluidos + noShows.length) > 0 ? (agendamentosConcluidos / (agendamentosConcluidos + noShows.length)) : 0;
    
    const clientsInPeriod = new Set(periodAppointments.map(a => a.customerId));
    let novosClientes = 0;
    let clientesRecorrentes = 0;
    const recurringClients = new Set<string>();

    clientsInPeriod.forEach(customerId => {
        const firstVisitDateStr = customerFirstAppointmentMap.get(customerId);
        if (firstVisitDateStr) {
            const firstVisitDate = fromYYYYMMDD(firstVisitDateStr);
            if (firstVisitDate.getTime() >= period.startDate.getTime() && firstVisitDate.getTime() <= period.endDate.getTime()) {
                novosClientes++;
            } else {
                 if (!recurringClients.has(customerId)) {
                    clientesRecorrentes++;
                    recurringClients.add(customerId);
                }
            }
        }
    });

    return {
        faturamento,
        ticketMedio,
        taxaComparecimento,
        novosClientes,
        totalAgendamentos,
        agendamentosConcluidos,
        clientesRecorrentes,
    };
};

export const useReportData = (appointments: Appointment[], customers: Customer[], employees: Employee[], period: Period) => {
     const customerFirstAppointmentMap = useMemo(() => {
        const map = new Map<string, string>();
        // Sort appointments oldest to newest to find the first one
        [...appointments]
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
            .forEach(a => {
                if (a.customerId && !map.has(a.customerId)) {
                    map.set(a.customerId, a.date);
                }
            });
        return map;
    }, [appointments]);

    const periodData = useMemo(() => {
        const { startDate, endDate } = period;
        
        const periodLengthDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
        
        // Use timestamp arithmetic to avoid Date type errors
        const comparisonEndDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        const comparisonStartDate = new Date(comparisonEndDate.getTime() - (periodLengthDays - 1) * 24 * 60 * 60 * 1000);

        const currentPeriodAppointments = appointments.filter(a => {
            const aDate = fromYYYYMMDD(a.date);
            return aDate.getTime() >= startDate.getTime() && aDate.getTime() <= endDate.getTime();
        });

        const comparisonPeriodAppointments = appointments.filter(a => {
            const aDate = fromYYYYMMDD(a.date);
            return aDate.getTime() >= comparisonStartDate.getTime() && aDate.getTime() <= comparisonEndDate.getTime();
        });

        return { currentPeriodAppointments, comparisonPeriodAppointments };
    }, [period, appointments]);

    const currentMetrics = useMemo(() => 
        calculateMetrics(periodData.currentPeriodAppointments, appointments, customerFirstAppointmentMap, period)
    , [periodData.currentPeriodAppointments, appointments, customerFirstAppointmentMap, period]);

    const comparisonMetrics = useMemo(() => {
        const periodLengthDays = Math.round((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 3600 * 24)) + 1;
        
        // Use timestamp arithmetic to avoid Date type errors
        const comparisonEndDate = new Date(period.startDate.getTime() - 24 * 60 * 60 * 1000);
        const comparisonStartDate = new Date(comparisonEndDate.getTime() - (periodLengthDays - 1) * 24 * 60 * 60 * 1000);
        
        const comparisonPeriod = { startDate: comparisonStartDate, endDate: comparisonEndDate, label: 'Previous Period'};
        return calculateMetrics(periodData.comparisonPeriodAppointments, appointments, customerFirstAppointmentMap, comparisonPeriod)
    }, [periodData.comparisonPeriodAppointments, appointments, customerFirstAppointmentMap, period]);

    const servicePopularity = useMemo(() => {
        const counts = periodData.currentPeriodAppointments
            .filter(a => a.status === 'Concluído')
            .reduce((acc, a) => {
                acc[a.serviceName] = (acc[a.serviceName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => (b.value as number) - (a.value as number))
            .slice(0, 6);
    }, [periodData.currentPeriodAppointments]);

    const peakHours = useMemo(() => {
        const counts = periodData.currentPeriodAppointments
            .filter(a => a.status === 'Concluído')
            .reduce((acc, a) => {
                const hour = a.time.split(':')[0];
                const label = `${hour}:00`;
                acc[label] = (acc[label] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [periodData.currentPeriodAppointments]);
    
    const professionalPerformance = useMemo(() => {
        const performance = periodData.currentPeriodAppointments
            .filter(a => a.status === 'Concluído')
            .reduce((acc, a) => {
                acc[a.professional] = (acc[a.professional] || 0) + a.price;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(performance)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => (b.value as number) - (a.value as number))
            .slice(0, 10);
    }, [periodData.currentPeriodAppointments]);

     const monthlyAppointments = useMemo(() => {
        const counts: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('pt-BR', { month: 'short' });
            counts[monthName] = 0;
        }

        appointments.forEach(a => {
            const aDate = new Date(a.date);
            const monthName = aDate.toLocaleString('pt-BR', { month: 'short' });
            if (counts[monthName] !== undefined) {
                counts[monthName]++;
            }
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [appointments]);

    const mostSoughtProfessionals = useMemo(() => {
        const performance = periodData.currentPeriodAppointments
            .filter(a => a.status === 'Concluído')
            .reduce((acc, a) => {
                acc[a.professional] = (acc[a.professional] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(performance)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => (b.value as number) - (a.value as number))
            .slice(0, 5);
    }, [periodData.currentPeriodAppointments]);

    return {
        currentMetrics,
        comparisonMetrics,
        servicePopularity,
        peakHours,
        professionalPerformance,
        monthlyAppointments,
        mostSoughtProfessionals
    };
};