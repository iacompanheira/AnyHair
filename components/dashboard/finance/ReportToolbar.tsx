// components/dashboard/finance/ReportToolbar.tsx
import React from 'react';
import PeriodSelector, { Period } from './PeriodSelector';
import { PlusIcon, FilePdfIcon, FileCsvIcon } from '../Icons';

interface ReportToolbarProps {
    period: Period;
    onPeriodChange: (period: Period) => void;
    onAddIncome: () => void;
    onAddExpense: () => void;
}

const ReportToolbar: React.FC<ReportToolbarProps> = ({ period, onPeriodChange, onAddIncome, onAddExpense }) => {
    return (
        <div className="flex flex-wrap gap-4 justify-between items-center bg-white/80 border border-gray-200 rounded-xl p-3">
            <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
            <div className="flex items-center gap-2">
                 <button onClick={onAddIncome} className="px-3 py-2 text-sm bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1">
                    <PlusIcon /> Entrada
                </button>
                 <button onClick={onAddExpense} className="px-3 py-2 text-sm bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1">
                    <PlusIcon /> Saída
                </button>
                <div className="h-6 border-l border-gray-300 mx-2"></div>
                <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" title="Exportar PDF"><FilePdfIcon /></button>
                <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" title="Exportar CSV"><FileCsvIcon /></button>
            </div>
        </div>
    );
};

export default ReportToolbar;
