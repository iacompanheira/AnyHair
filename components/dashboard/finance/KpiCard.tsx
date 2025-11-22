// components/dashboard/finance/KpiCard.tsx
import React from 'react';
import TrendIndicator from './TrendIndicator';
import { DollarIcon, TrendUpIcon, TrendDownIcon, CheckCircleIcon } from '../Icons';

interface KpiCardProps {
    title: string;
    value: number;
    previousValue?: number;
    goal?: number;
    format: 'currency' | 'number' | 'break-even';
}

const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const KpiCard: React.FC<KpiCardProps> = ({ title, value, previousValue, goal, format }) => {
    const isPositive = format !== 'break-even' && (
        (title.toLowerCase().includes('despesa') && value < (previousValue ?? 0)) ||
        (!title.toLowerCase().includes('despesa') && value > (previousValue ?? 0))
    );

    const mainValueColor = () => {
        if (format === 'break-even') {
            const progress = goal ? (value / goal) : 0;
            if (progress >= 1) return 'text-green-500';
            if (progress > 0.7) return 'text-yellow-500';
            return 'text-red-500';
        }
        if (title.toLowerCase().includes('despesa')) return 'text-red-500';
        if (title.toLowerCase().includes('lucro') && value < 0) return 'text-red-500';
        return 'text-green-500';
    };

    const renderMainValue = () => {
        switch(format) {
            case 'currency': return formatCurrency(value);
            case 'break-even': return formatCurrency(value);
            case 'number': return value.toLocaleString('pt-BR');
        }
    };
    
    return (
        <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-600">{title}</h4>
            <p className={`text-2xl font-bold my-1 ${mainValueColor()}`}>{renderMainValue()}</p>
            {format === 'break-even' && goal !== undefined ? (
                 <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Meta: {formatCurrency(goal)}</span>
                        <span>{goal > 0 ? ((value / goal) * 100).toFixed(0) : '0'}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${mainValueColor().replace('text-', 'bg-')}`} style={{ width: `${goal > 0 ? Math.min((value / goal) * 100, 100) : 0}%`}}></div>
                    </div>
                 </div>
            ) : previousValue !== undefined ? (
                 <TrendIndicator currentValue={value} previousValue={previousValue} positiveIsGood={!title.toLowerCase().includes('despesa')} />
            ) : (
                <p className="text-xs text-gray-400">&nbsp;</p> 
            )}
        </div>
    );
};

export default KpiCard;
