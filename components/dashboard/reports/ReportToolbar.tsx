// components/dashboard/reports/ReportToolbar.tsx
import React from 'react';
import PeriodSelector, { Period } from './PeriodSelector';
import { PrintIcon, FilePdfIcon, FileCsvIcon } from '../Icons';

interface ReportToolbarProps {
    period: Period;
    onPeriodChange: (period: Period) => void;
}

const ReportToolbar: React.FC<ReportToolbarProps> = ({ period, onPeriodChange }) => {
    return (
        <div className="flex flex-wrap gap-4 justify-between items-center bg-white/80 border border-gray-200 rounded-xl p-3 shadow-sm">
            <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
            <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" title="Imprimir"><PrintIcon /></button>
                <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" title="Exportar PDF"><FilePdfIcon /></button>
                <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" title="Exportar CSV"><FileCsvIcon /></button>
            </div>
        </div>
    );
};

export default ReportToolbar;
