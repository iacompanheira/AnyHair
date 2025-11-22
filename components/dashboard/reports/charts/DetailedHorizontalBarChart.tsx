// components/dashboard/reports/charts/DetailedHorizontalBarChart.tsx
import React, { useState } from 'react';

interface ChartDataItem {
    name: string;
    value: number;
}

interface DetailedHorizontalBarChartProps {
    data: ChartDataItem[];
    color?: string;
}

const DetailedHorizontalBarChart: React.FC<DetailedHorizontalBarChartProps> = ({ data, color = '#10b981' }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number } | null>(null);

    if (!data || data.length === 0) {
        return <p className="text-gray-500 text-sm text-center py-8">Sem dados para exibir.</p>;
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);

    const handleMouseMove = (e: React.MouseEvent, value: number) => {
        setTooltip({ x: e.clientX, y: e.clientY, value });
    };

    return (
        <div className="w-full space-y-4 px-4">
            {data.map(item => (
                <div
                    key={item.name}
                    className="flex items-center gap-2 group"
                    onMouseMove={(e) => handleMouseMove(e, item.value)}
                    onMouseLeave={() => setTooltip(null)}
                >
                    <div className="relative h-8 flex-grow bg-gray-200 rounded-r-lg">
                        <div
                            className="absolute left-0 top-0 h-8 rounded-r-lg transition-all duration-300"
                            style={{
                                width: `${(item.value / maxValue) * 100}%`,
                                backgroundColor: color,
                            }}
                        >
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white font-bold text-sm whitespace-nowrap">
                                {item.name}
                            </span>
                        </div>
                    </div>
                    <span className="w-20 text-left font-semibold text-gray-700 text-sm">
                        {item.value} atend.
                    </span>
                </div>
            ))}
            {tooltip && (
                <div className="fixed p-2 text-xs bg-gray-800 text-white rounded-md shadow-lg pointer-events-none" style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}>
                    <p>Atendimentos: {tooltip.value}</p>
                </div>
            )}
        </div>
    );
};

export default DetailedHorizontalBarChart;
