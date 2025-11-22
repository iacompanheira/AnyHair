
// hooks/useCommissionData.ts
import { useMemo } from 'react';
import type { Appointment, Employee, CostSettings } from '../types';
import { fromYYYYMMDD } from '../utils/date';

export interface Period {
    startDate: Date;
    endDate: Date;
    label: string;
}

export interface CommissionData {
    professionalId: string;
    professionalName: string;
    professionalImage?: string;
    totalRevenue: number;
    totalAppointments: number;
    commissionRate: number;
    commissionAmount: number;
}

export interface CommissionMetrics {
    totalRevenue: number;
    totalCommission: number;
    totalAppointments: number;
    data: CommissionData[];
}

export const useCommissionData = (
    appointments: Appointment[],
    employees: Employee[],
    draftSettings: { defaultRate: number; overrides: { [key: string]: number | undefined } },
    period: Period
): { currentMetrics: CommissionMetrics; comparisonMetrics: CommissionMetrics } => {

    const calculateMetrics = (
        periodAppointments: Appointment[],
        commissionSettings: { defaultRate: number; overrides: { [key: string]: number | undefined } }
    ): CommissionMetrics => {
        const professionals = employees.filter(e => e.accessLevel === 'Profissional' && e.status === 'Ativo');

        const dataByPro: { [key: string]: { revenue: number, appointments: number } } = {};

        professionals.forEach(p => {
            dataByPro[p.id] = { revenue: 0, appointments: 0 };
        });

        periodAppointments.forEach(appt => {
            if (appt.status === 'Concluído') {
                const pro = employees.find(e => e.name === appt.professional);
                if (pro && dataByPro[pro.id]) {
                    dataByPro[pro.id].revenue += appt.price;
                    dataByPro[pro.id].appointments += 1;
                }
            }
        });

        const commissionData: CommissionData[] = professionals.map(pro => {
            const proData = dataByPro[pro.id];
            const commissionRate = commissionSettings.overrides[pro.id] ?? commissionSettings.defaultRate;
            const commissionAmount = proData.revenue * (commissionRate / 100);

            return {
                professionalId: pro.id,
                professionalName: pro.name,
                professionalImage: pro.imageUrl,
                totalRevenue: proData.revenue,
                totalAppointments: proData.appointments,
                commissionRate: commissionRate,
                commissionAmount: commissionAmount
            };
        });

        const totalRevenue = commissionData.reduce((sum, d) => sum + d.totalRevenue, 0);
        const totalCommission = commissionData.reduce((sum, d) => sum + d.commissionAmount, 0);
        const totalAppointments = commissionData.reduce((sum, d) => sum + d.totalAppointments, 0);

        return {
            totalRevenue,
            totalCommission,
            totalAppointments,
            data: commissionData.sort((a,b) => b.totalRevenue - a.totalRevenue)
        };
    };

    const periodData = useMemo(() => {
        const { startDate, endDate } = period;
        
        const periodLengthDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
        
        const comparisonEndDate = new Date(startDate);
        comparisonEndDate.setDate(startDate.getDate() - 1);
        const comparisonStartDate = new Date(comparisonEndDate);
        comparisonStartDate.setDate(comparisonEndDate.getDate() - (periodLengthDays - 1));

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
        calculateMetrics(periodData.currentPeriodAppointments, draftSettings)
    , [periodData.currentPeriodAppointments, draftSettings, employees]);

    const comparisonMetrics = useMemo(() =>
        calculateMetrics(periodData.comparisonPeriodAppointments, draftSettings)
    , [periodData.comparisonPeriodAppointments, draftSettings, employees]);
    
    return { currentMetrics, comparisonMetrics };
};
