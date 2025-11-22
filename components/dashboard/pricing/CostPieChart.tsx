// components/dashboard/pricing/CostPieChart.tsx
import React from 'react';

interface ChartData {
    label: string;
    value: number;
    color: string;
}

interface CostPieChartProps {
    data: ChartData[];
}

const CostPieChart: React.FC<CostPieChartProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return <div className="text-center text-gray-500 py-8">Insira os custos para ver o gráfico.</div>;
    }

    let cumulativePercent = 0;
    const segments = data.map(item => {
        const percent = item.value / total;
        const segment = {
            ...item,
            percent,
            startAngle: cumulativePercent * 360,
            endAngle: (cumulativePercent + percent) * 360,
        };
        cumulativePercent += percent;
        return segment;
    });

    const getCoordinates = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-40 h-40">
                <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
                    {segments.map(segment => {
                        const [startX, startY] = getCoordinates(segment.startAngle / 360);
                        const [endX, endY] = getCoordinates(segment.endAngle / 360);
                        const largeArcFlag = segment.percent > 0.5 ? 1 : 0;

                        return (
                            <path
                                key={segment.label}
                                d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`}
                                fill={segment.color}
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="w-full space-y-2 text-sm">
                {segments.map(segment => (
                    <div key={segment.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: segment.color }}></div>
                            <span>{segment.label}</span>
                        </div>
                        <span className="font-semibold text-gray-600">
                            {(segment.percent * 100).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CostPieChart;
