// components/dashboard/reports/TrendIndicator.tsx
import React from 'react';
import { TrendUpIcon, TrendDownIcon } from '../Icons';

interface TrendIndicatorProps {
    currentValue: number;
    previousValue: number;
    positiveIsGood?: boolean;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ currentValue, previousValue, positiveIsGood = true }) => {
    if (previousValue === 0) {
        if (currentValue > 0) return <span className="text-xs font-semibold text-green-500 flex items-center gap-1"><TrendUpIcon className="w-4 h-4"/> Novo</span>;
        return <span className="text-xs text-gray-500">- vs. período anterior</span>;
    }

    const percentChange = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    
    if (Math.abs(percentChange) < 0.1) {
        return <span className="text-xs text-gray-500">~ 0,0% vs. período anterior</span>;
    }

    const isPositiveChange = percentChange > 0;
    const isGood = positiveIsGood ? isPositiveChange : !isPositiveChange;

    return (
        <span className={`text-xs font-semibold flex items-center gap-1 ${isGood ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? <TrendUpIcon className="w-4 h-4" /> : <TrendDownIcon className="w-4 h-4" />}
            {Math.abs(percentChange).toFixed(1).replace('.', ',')}% vs. período anterior
        </span>
    );
};

export default TrendIndicator;
