// components/dashboard/finance/CashFlowChart.tsx
import React, { useState } from 'react';

interface ChartDataPoint {
    date: string;
    income: number;
    expense: number;
    balance: number;
}

interface CashFlowChartProps {
    data: ChartDataPoint[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, data: ChartDataPoint } | null>(null);

    if (data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-500">Sem dados para o período selecionado.</div>;
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = 600;
    const chartHeight = 300;
    
    const contentWidth = chartWidth - padding.left - padding.right;
    const contentHeight = chartHeight - padding.top - padding.bottom;

    const maxBarValue = Math.max(...data.map(d => Math.max(d.income, d.expense)));
    const minBalance = Math.min(0, ...data.map(d => d.balance));
    const maxBalance = Math.max(...data.map(d => d.balance));

    const yBarScale = (value: number) => contentHeight - (value / maxBarValue) * contentHeight;
    const yLineScale = (value: number) => contentHeight - ((value - minBalance) / (maxBalance - minBalance)) * contentHeight;

    const barWidth = contentWidth / data.length * 0.8;
    const barGap = contentWidth / data.length * 0.2;

    const linePath = data.map((d, i) => {
        const x = i * (barWidth + barGap) + (barWidth + barGap) / 2;
        const y = yLineScale(d.balance);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');
    
    const yAxisTicks = 5;
    const yAxisValues = Array.from({ length: yAxisTicks + 1 }, (_, i) => maxBarValue * (i / yAxisTicks));

    return (
        <div className="relative">
            <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <g transform={`translate(${padding.left}, ${padding.top})`}>
                    {/* Y-Axis Grid Lines & Labels */}
                    {yAxisValues.map((value, i) => (
                        <g key={i}>
                            <line x1={0} y1={yBarScale(value)} x2={contentWidth} y2={yBarScale(value)} stroke="#E5E7EB" strokeDasharray="2" />
                            <text x={-10} y={yBarScale(value)} dy="0.32em" textAnchor="end" fontSize="10" fill="#6B7281">
                                {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' })}
                            </text>
                        </g>
                    ))}
                    <line x1={0} y1={0} x2={0} y2={contentHeight} stroke="#D1D5DB" />
                    
                    {/* Bars and Line */}
                    {data.map((d, i) => {
                        const x = i * (barWidth + barGap);
                        return (
                            <g key={d.date} onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltip({ x: e.clientX, y: e.clientY, data: d });
                             }} onMouseLeave={() => setTooltip(null)}>
                                <rect x={x} y={yBarScale(d.income)} width={barWidth / 2} height={contentHeight - yBarScale(d.income)} fill="#10B981" opacity={0.7} />
                                <rect x={x + barWidth / 2} y={yBarScale(d.expense)} width={barWidth / 2} height={contentHeight - yBarScale(d.expense)} fill="#EF4444" opacity={0.7}/>
                                <circle cx={x + barWidth / 2} cy={yLineScale(d.balance)} r="3" fill="#3B82F6" />
                            </g>
                        );
                    })}
                     <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="2" />

                    {/* X-Axis Labels */}
                    {data.map((d, i) => {
                         if (data.length > 7 && i % Math.floor(data.length / 7) !== 0) return null;
                         const x = i * (barWidth + barGap) + barWidth / 2;
                         return <text key={d.date} x={x} y={contentHeight + 20} textAnchor="middle" fontSize="10" fill="#6B7281">{new Date(d.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</text>
                    })}
                </g>
            </svg>
             {tooltip && (
                <div className="fixed p-2 text-xs bg-gray-800 text-white rounded-md shadow-lg pointer-events-none" style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}>
                    <p className="font-bold">{new Date(tooltip.data.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                    <p className="text-green-400">Faturamento: {tooltip.data.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-red-400">Despesas: {tooltip.data.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-blue-400">Saldo: {tooltip.data.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
            )}
        </div>
    );
};

export default CashFlowChart;
