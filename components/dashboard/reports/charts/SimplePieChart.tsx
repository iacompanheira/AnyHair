// components/dashboard/reports/charts/SimplePieChart.tsx
import React from 'react';

interface ChartDataItem {
    name: string;
    value: number;
}

interface SimplePieChartProps {
    data: ChartDataItem[];
}

const PIE_CHART_COLORS = ["#EC4899", "#F59E0B", "#8B5CF6", "#10B981", "#3B82F6", "#6366F1", "#D946EF"];

const PieChartSegment: React.FC<{
    startAngle: number;
    endAngle: number;
    color: string;
}> = ({ startAngle, endAngle, color }) => {
    const radius = 0.5;
    const getCoordinates = (angle: number) => [
        radius * Math.cos(angle),
        radius * Math.sin(angle)
    ];

    const [startX, startY] = getCoordinates(startAngle);
    const [endX, endY] = getCoordinates(endAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    const pathData = [
        `M ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        `L 0 0`,
    ].join(' ');

    return <path d={pathData} fill={color} />;
};


const SimplePieChart: React.FC<SimplePieChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-500">Sem dados para exibir.</p>;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativeAngle = 0;

    return (
        <div className="w-full flex flex-col md:flex-row items-center gap-6">
            <div className="w-40 h-40 flex-shrink-0">
                <svg viewBox="-0.5 -0.5 1 1" style={{ transform: 'rotate(-90deg)' }}>
                    {data.map((item, index) => {
                        const angle = (item.value / total) * 2 * Math.PI;
                        const segment = (
                            <PieChartSegment
                                key={item.name}
                                startAngle={cumulativeAngle}
                                endAngle={cumulativeAngle + angle}
                                color={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                            />
                        );
                        cumulativeAngle += angle;
                        return segment;
                    })}
                </svg>
            </div>
            <div className="w-full space-y-2 text-sm">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}></div>
                            <span className="truncate max-w-[150px]">{item.name}</span>
                        </div>
                        <span className="font-semibold text-gray-600">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimplePieChart;
