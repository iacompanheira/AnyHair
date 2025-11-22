// components/dashboard/reports/ClientAnalysis.tsx
import React, { useState, useMemo } from 'react';
import type { Customer, Appointment } from '../../../types';
import { Period } from '../../../hooks/useReportData';
import HorizontalBarChart from './charts/HorizontalBarChart';
import ClientDetailModal from './ClientDetailModal';
import { fromYYYYMMDD } from '../../../utils/date';

type AnalysisType = 'top_spenders' | 'at_risk';

interface ClientAnalysisProps {
    allAppointments: Appointment[];
    allCustomers: Customer[];
    period: Period;
}

const ClientAnalysis: React.FC<ClientAnalysisProps> = ({ allAppointments, allCustomers, period }) => {
    const [analysisType, setAnalysisType] = useState<AnalysisType>('top_spenders');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const customerMap = useMemo(() => new Map(allCustomers.map(c => [c.id, c])), [allCustomers]);

    const chartData = useMemo(() => {
        if (analysisType === 'top_spenders') {
            const spenders = allAppointments
                .filter(a => {
                    const aDate = fromYYYYMMDD(a.date);
                    return aDate.getTime() >= period.startDate.getTime() && aDate.getTime() <= period.endDate.getTime() && a.status === 'Concluído';
                })
                .reduce((acc, a) => {
                    if (a.customerId) {
                        acc[a.customerId] = (acc[a.customerId] || 0) + a.price;
                    }
                    return acc;
                }, {} as Record<string, number>);

            return Object.entries(spenders)
                .map(([customerId, value]) => ({
                    id: customerId,
                    name: customerMap.get(customerId)?.name || 'Cliente Desconhecido',
                    value,
                }))
                .sort((a, b) => (b.value as number) - (a.value as number))
                .slice(0, 10);
        }

        if (analysisType === 'at_risk') {
            const today = new Date();
            
            // Use timestamp arithmetic to avoid Date type errors
            const atRiskThreshold = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
            const tooOldThreshold = new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000);

            const lastVisitMap = new Map<string, string>();
            allAppointments.forEach(a => {
                if (a.customerId && a.status === 'Concluído') {
                    const lastVisit = lastVisitMap.get(a.customerId);
                    if (!lastVisit || a.date > lastVisit) {
                        lastVisitMap.set(a.customerId, a.date);
                    }
                }
            });

            return Array.from(lastVisitMap.entries())
                .map(([customerId, lastVisitDate]) => ({
                    id: customerId,
                    name: customerMap.get(customerId)?.name || 'Cliente Desconhecido',
                    lastVisit: fromYYYYMMDD(lastVisitDate)
                }))
                .filter(c => c.lastVisit.getTime() >= tooOldThreshold.getTime() && c.lastVisit.getTime() <= atRiskThreshold.getTime())
                .sort((a, b) => a.lastVisit.getTime() - b.lastVisit.getTime())
                .slice(0, 10)
                .map((c) => ({
                    id: c.id,
                    name: c.name,
                    value: Math.round((today.getTime() - c.lastVisit.getTime()) / (1000 * 3600 * 24))
                }));
        }

        return [];
    }, [analysisType, allAppointments, period, customerMap]);
    
    const handleBarClick = (bar: { id?: string }) => {
        if(bar.id) {
            const customer = customerMap.get(bar.id);
            if(customer) setSelectedCustomer(customer);
        }
    }

    return (
        <div className="w-full h-full flex flex-col">
            {selectedCustomer && <ClientDetailModal customer={selectedCustomer} allAppointments={allAppointments} onClose={() => setSelectedCustomer(null)} />}
            <div className="flex-shrink-0 flex items-center gap-1 bg-gray-200 p-1 rounded-lg mb-4">
                <button
                    onClick={() => setAnalysisType('top_spenders')}
                    className={`w-full px-3 py-1 text-sm font-semibold rounded-md transition-colors ${analysisType === 'top_spenders' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-600'}`}
                >
                    Top Clientes
                </button>
                <button
                    onClick={() => setAnalysisType('at_risk')}
                    className={`w-full px-3 py-1 text-sm font-semibold rounded-md transition-colors ${analysisType === 'at_risk' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-600'}`}
                >
                    Clientes em Risco
                </button>
            </div>
            <div className="flex-grow">
                 <HorizontalBarChart
                    data={chartData}
                    format={analysisType === 'top_spenders' ? 'currency' : 'days'}
                    onBarClick={handleBarClick}
                />
            </div>
        </div>
    );
};

export default ClientAnalysis;