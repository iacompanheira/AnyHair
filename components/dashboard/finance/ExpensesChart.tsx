// components/dashboard/finance/ExpensesChart.tsx
import React from 'react';

interface ExpenseData {
    category: string;
    amount: number;
    color: string;
}

interface ExpensesChartProps {
    data: ExpenseData[];
    view: 'pie' | 'bar';
}

const PieChart: React.FC<{ data: ExpenseData[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    if (total === 0) return <div className="h-48 flex items-center justify-center text-gray-500">Sem despesas no período.</div>;

    let cumulativePercent = 0;

    const getCoordinates = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-48 h-48">
            {data.map(item => {
                const percent = item.amount / total;
                const [startX, startY] = getCoordinates(cumulativePercent);
                cumulativePercent += percent;
                const [endX, endY] = getCoordinates(cumulativePercent);
                const largeArcFlag = percent > 0.5 ? 1 : 0;

                return (
                    <path
                        key={item.category}
                        d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`}
                        fill={item.color}
                    />
                );
            })}
        </svg>
    );
};

const BarChart: React.FC<{ data: ExpenseData[] }> = ({ data }) => {
    const maxAmount = Math.max(...data.map(d => d.amount));
    if (maxAmount === 0) return <div className="h-48 flex items-center justify-center text-gray-500">Sem despesas no período.</div>;
    
    return (
        <div className="space-y-2 w-full">
            {data.map(item => (
                <div key={item.category} className="flex items-center gap-2">
                    <div className="w-24 text-right text-xs text-gray-500 truncate">{item.category}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                            className="h-4 rounded-full"
                            style={{ width: `${(item.amount / maxAmount) * 100}%`, backgroundColor: item.color }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};


const ExpensesChart: React.FC<ExpensesChartProps> = ({ data, view }) => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {view === 'pie' ? <PieChart data={data} /> : <BarChart data={data} />}
             <div className="w-full space-y-2 text-sm self-start">
                {data.map(item => (
                    <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                            <span>{item.category}</span>
                        </div>
                        <span className="font-semibold text-gray-600">
                           {total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0.0'}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpensesChart;
