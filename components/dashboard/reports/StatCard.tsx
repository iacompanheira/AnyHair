// components/dashboard/reports/StatCard.tsx
import React from 'react';
import TrendIndicator from './TrendIndicator';

interface StatCardProps {
    title: string;
    value: number;
    previousValue: number;
    format: 'currency' | 'number' | 'percent';
}

const formatValue = (value: number, format: StatCardProps['format']) => {
    switch (format) {
        case 'currency':
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        case 'number':
            return value.toLocaleString('pt-BR');
        case 'percent':
            return `${(value * 100).toFixed(1)}%`.replace('.', ',');
    }
};

const StatCard: React.FC<StatCardProps> = ({ title, value, previousValue, format }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-600">{title}</h4>
            <p className="text-3xl font-bold my-2 text-gray-800">{formatValue(value, format)}</p>
            <TrendIndicator currentValue={value} previousValue={previousValue} positiveIsGood={title !== 'Despesas Totais'} />
        </div>
    );
};

export default StatCard;
