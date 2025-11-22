// components/dashboard/reports/CommissionReportScreen.tsx
import React, { useState, useEffect } from 'react';
import type { Employee, Appointment, CostSettings } from '../../../types';
import { useCommissionData, Period } from '../../../hooks/useCommissionData';

import ReportToolbar from './ReportToolbar';
import StatCard from './StatCard';
import SaveBar from '../SaveBar';
import { ArrowLeftIcon, UserIcon } from '../Icons';
import TrendIndicator from './TrendIndicator';

interface CommissionReportScreenProps {
    appointments: Appointment[];
    employees: Employee[];
    onEmployeesChange: (employees: Employee[]) => void;
    costSettings: CostSettings;
    onCostSettingsChange: (settings: CostSettings) => void;
    onBack: () => void;
}

const CommissionReportScreen: React.FC<CommissionReportScreenProps> = ({ appointments, employees, onEmployeesChange, costSettings, onCostSettingsChange, onBack }) => {
    const [period, setPeriod] = useState<Period>(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29); // Last 30 days
        return { startDate, endDate, label: 'Últimos 30 dias' };
    });

    // Draft state for commission settings
    const [draftDefaultRate, setDraftDefaultRate] = useState(costSettings.personnel.defaultCommissionRate);
    const [draftOverrides, setDraftOverrides] = useState<{[key: string]: number | undefined}>(() => {
        return employees.reduce((acc, e) => {
            acc[e.id] = e.commissionRate;
            return acc;
        }, {} as {[key: string]: number | undefined});
    });

    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        const defaultChanged = draftDefaultRate !== costSettings.personnel.defaultCommissionRate;
        const overridesChanged = employees.some(e => draftOverrides[e.id] !== e.commissionRate);
        setHasChanges(defaultChanged || overridesChanged);
    }, [draftDefaultRate, draftOverrides, costSettings, employees]);

    const { currentMetrics, comparisonMetrics } = useCommissionData(
        appointments,
        employees,
        { defaultRate: draftDefaultRate, overrides: draftOverrides },
        period
    );

    const handleSave = () => {
        setSaveStatus('saving');
        onCostSettingsChange({
            ...costSettings,
            personnel: {
                ...costSettings.personnel,
                defaultCommissionRate: draftDefaultRate
            }
        });
        onEmployeesChange(employees.map(emp => ({
            ...emp,
            commissionRate: draftOverrides[emp.id]
        })));
        setTimeout(() => setSaveStatus('saved'), 1000);
        setTimeout(() => setSaveStatus('idle'), 3000);
    };

    const handleCancel = () => {
        setDraftDefaultRate(costSettings.personnel.defaultCommissionRate);
        setDraftOverrides(employees.reduce((acc, e) => {
            acc[e.id] = e.commissionRate;
            return acc;
        }, {} as {[key: string]: number | undefined}));
    };
    
    const handleApplyToAll = () => {
        const newOverrides: { [key: string]: number } = {};
        employees.forEach(e => {
            if (e.accessLevel === 'Profissional') {
                newOverrides[e.id] = draftDefaultRate;
            }
        });
        setDraftOverrides(newOverrides);
    };

    const handleIndividualRateChange = (employeeId: string, value: string) => {
        const numValue = parseFloat(value);
        setDraftOverrides(prev => ({
            ...prev,
            [employeeId]: isNaN(numValue) ? undefined : numValue,
        }));
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full text-gray-800">
            <header className="flex items-center mb-6 flex-shrink-0">
                 <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                 <h3 className="text-2xl font-light tracking-wider">Relatório de Comissões</h3>
            </header>
            <div className="flex-grow overflow-y-auto pr-2 pb-24 space-y-6">
                <ReportToolbar period={period} onPeriodChange={setPeriod} />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Faturamento Total" value={currentMetrics.totalRevenue} previousValue={comparisonMetrics.totalRevenue} format="currency" />
                    <StatCard title="Total de Comissões" value={currentMetrics.totalCommission} previousValue={comparisonMetrics.totalCommission} format="currency" />
                    <StatCard title="Total de Atendimentos" value={currentMetrics.totalAppointments} previousValue={comparisonMetrics.totalAppointments} format="number" />
                </div>

                {/* Quick Adjust Panel */}
                <div className="bg-white/80 border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Comissão Padrão</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={draftDefaultRate}
                                onChange={e => setDraftDefaultRate(parseFloat(e.target.value) || 0)}
                                className="w-40 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md pr-8"
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
                        </div>
                    </div>
                    <button onClick={handleApplyToAll} className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600">
                        Aplicar a Todos
                    </button>
                </div>
                
                {/* Professionals List */}
                <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                    <ul className="divide-y divide-gray-200">
                        {currentMetrics.data.map(pro => {
                            const comparisonPro = comparisonMetrics.data.find(p => p.professionalId === pro.professionalId);
                            return (
                            <li key={pro.professionalId} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex-shrink-0 ${pro.professionalImage ? '' : 'bg-gray-200'}`}>
                                        {pro.professionalImage ? <img src={pro.professionalImage} alt={pro.professionalName} className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-full h-full text-gray-400 p-2" />}
                                    </div>
                                    <span className="font-semibold">{pro.professionalName}</span>
                                </div>
                                <div className="col-span-2 grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <p className="font-semibold text-gray-500">Faturamento</p>
                                        <p className="font-bold text-lg text-gray-800">{pro.totalRevenue.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</p>
                                        <TrendIndicator currentValue={pro.totalRevenue} previousValue={comparisonPro?.totalRevenue ?? 0} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-500">Comissão</p>
                                        <p className="font-bold text-lg text-green-600">{pro.commissionAmount.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</p>
                                        <TrendIndicator currentValue={pro.commissionAmount} previousValue={comparisonPro?.commissionAmount ?? 0} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-500">Atendimentos</p>
                                        <p className="font-bold text-lg text-gray-800">{pro.totalAppointments}</p>
                                        <TrendIndicator currentValue={pro.totalAppointments} previousValue={comparisonPro?.totalAppointments ?? 0} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Comissão Individual (%)</label>
                                    <input 
                                        type="number" 
                                        value={draftOverrides[pro.professionalId] ?? ''}
                                        placeholder={String(draftDefaultRate)}
                                        onChange={e => handleIndividualRateChange(pro.professionalId, e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </li>
                        )})}
                    </ul>
                </div>
            </div>
            {hasChanges && <SaveBar hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel} />}
        </div>
    );
};

export default CommissionReportScreen;