// components/dashboard/reports/ReportsScreen.tsx
import React, { useState } from 'react';
import type { Appointment, Customer, Employee } from '../../../types';
import { useReportData, Period } from '../../../hooks/useReportData';

import ReportToolbar from './ReportToolbar';
import StatCard from './StatCard';
import ReportBlock from './ReportBlock';
import ClientAnalysis from './ClientAnalysis';
import SimplePieChart from './charts/SimplePieChart';
import SimpleBarChart from './charts/SimpleBarChart';
import HorizontalBarChart from './charts/HorizontalBarChart';
import DetailedHorizontalBarChart from './charts/DetailedHorizontalBarChart';

import { BarChartIcon, ClipboardListIcon, ClockIcon, UserGroupIcon, UsersIcon } from '../Icons';

interface ReportsScreenProps {
    appointments: Appointment[];
    customers: Customer[];
    employees: Employee[];
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ appointments, customers, employees }) => {
    const [period, setPeriod] = useState<Period>(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29); // Last 30 days
        return { startDate, endDate, label: 'Últimos 30 dias' };
    });

    const {
        currentMetrics,
        comparisonMetrics,
        servicePopularity,
        peakHours,
        professionalPerformance,
        monthlyAppointments,
        mostSoughtProfessionals,
    } = useReportData(appointments, customers, employees, period);

    return (
        <div className="space-y-6">
            <ReportToolbar period={period} onPeriodChange={setPeriod} />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Faturamento" value={currentMetrics.faturamento} previousValue={comparisonMetrics.faturamento} format="currency" />
                <StatCard title="Agend. Concluídos" value={currentMetrics.agendamentosConcluidos} previousValue={comparisonMetrics.agendamentosConcluidos} format="number" />
                <StatCard title="Ticket Médio" value={currentMetrics.ticketMedio} previousValue={comparisonMetrics.ticketMedio} format="currency" />
                <StatCard title="Taxa de Comparecimento" value={currentMetrics.taxaComparecimento} previousValue={comparisonMetrics.taxaComparecimento} format="percent" />
                <StatCard title="Novos Clientes" value={currentMetrics.novosClientes} previousValue={comparisonMetrics.novosClientes} format="number" />
                <StatCard title="Clientes Recorrentes" value={currentMetrics.clientesRecorrentes} previousValue={comparisonMetrics.clientesRecorrentes} format="number" />
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportBlock title="Popularidade dos Serviços" icon={<ClipboardListIcon className="w-5 h-5 text-pink-500" />}>
                    <SimplePieChart data={servicePopularity} />
                </ReportBlock>
                <ReportBlock title="Horários de Pico" icon={<ClockIcon className="w-5 h-5 text-pink-500" />}>
                    <SimpleBarChart data={peakHours} />
                </ReportBlock>

                <div className="lg:col-span-2">
                    <ReportBlock title="Agendamentos (Mês a Mês)" icon={<BarChartIcon className="w-5 h-5 text-pink-500" />}>
                        <SimpleBarChart data={monthlyAppointments} />
                    </ReportBlock>
                </div>

                <div className="lg:col-span-2">
                    <ReportBlock title="Profissionais Mais Procurados (por Nº de Atendimentos)" icon={<UserGroupIcon className="w-5 h-5 text-pink-500" />}>
                        <DetailedHorizontalBarChart data={mostSoughtProfessionals} />
                    </ReportBlock>
                </div>

                <ReportBlock title="Desempenho por Profissional (por Faturamento)" icon={<UserGroupIcon className="w-5 h-5 text-pink-500" />}>
                     <HorizontalBarChart data={professionalPerformance} format="currency" />
                </ReportBlock>
                 <ReportBlock title="Análise de Clientes" icon={<UsersIcon className="w-5 h-5 text-pink-500" />}>
                    <ClientAnalysis allAppointments={appointments} allCustomers={customers} period={period} />
                </ReportBlock>
            </div>
        </div>
    );
};

export default ReportsScreen;