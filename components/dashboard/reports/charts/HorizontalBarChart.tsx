// components/dashboard/reports/charts/HorizontalBarChart.tsx
import React from 'react';

interface ChartDataItem {
    id?: string;
    name: string;
    value: number;
}

interface HorizontalBarChartProps {
    data: ChartDataItem[];
    format?: 'currency' | 'number' | 'days';
    onBarClick?: (bar: ChartDataItem) => void;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, format = 'number', onBarClick }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-500 text-sm text-center py-8">Sem dados para exibir.</p>;
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);

    const formatValue = (value: number) => {
        switch(format) {
            case 'currency': return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            case 'days': return `${value} dias`;
            case 'number': return value.toLocaleString('pt-BR');
        }
    };

    return (
        <div className="w-full space-y-3">
            {data.map(item => (
                <div key={item.name} className="group" onClick={() => onBarClick?.(item)}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 truncate">{item.name}</span>
                        <span className="font-semibold text-gray-800">{formatValue(item.value)}</span>
                    </div>
                    <div className={`w-full bg-gray-200 rounded-full h-4 ${onBarClick ? 'cursor-pointer' : ''}`}>
                        <div
                            className="bg-pink-500 h-4 rounded-full transition-all duration-300 group-hover:bg-pink-600"
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HorizontalBarChart;
