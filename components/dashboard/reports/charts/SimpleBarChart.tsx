// components/dashboard/reports/charts/SimpleBarChart.tsx
import React, { useState, useRef, useEffect } from 'react';

interface ChartDataItem {
    name: string;
    value: number;
}

interface SimpleBarChartProps {
    data: ChartDataItem[];
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, data: ChartDataItem } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver(entries => {
                if (entries[0]) {
                    setWidth(entries[0].contentRect.width);
                }
            });
            resizeObserver.observe(containerRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);
    
    if (!data || data.length === 0) {
        return <p className="text-gray-500">Sem dados para exibir.</p>;
    }
    
    // Define total canvas size and padding
    const chartHeight = 250;
    const padding = { top: 20, right: 10, bottom: 30, left: 40 };

    if (width === 0) {
        return <div ref={containerRef} className="w-full h-full min-h-[250px]"></div>;
    }

    // Calculate drawable area dimensions
    const contentWidth = width - padding.left - padding.right;
    const contentHeight = chartHeight - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map(d => d.value), 0);
    // Create a "nice" upper bound for the y-axis, like 800 in the user's image
    const roundedMaxValue = maxValue > 0 ? Math.ceil(maxValue / (maxValue > 1000 ? 200 : 100)) * (maxValue > 1000 ? 200 : 100) : 100;

    const barWidth = (contentWidth / data.length) * 0.6;
    const barSpacing = (contentWidth / data.length) * 0.4;

    const numTicks = 4; // To get 0, 200, 400, 600, 800
    const tickValues = Array.from({ length: numTicks + 1 }, (_, i) => (roundedMaxValue / numTicks) * i);

    return (
        <div className="w-full relative" ref={containerRef}>
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${width} ${chartHeight}`}>
                <g transform={`translate(${padding.left}, ${padding.top})`}>
                    {/* Y-Axis Grid Lines & Labels */}
                    {tickValues.map((value, i) => {
                        const y = contentHeight - (value / roundedMaxValue) * contentHeight;
                        return (
                            <g key={i}>
                                <line 
                                    x1={0} y1={y} x2={contentWidth} y2={y} 
                                    stroke="#E5E7EB" 
                                    strokeDasharray="2 2" 
                                />
                                <text 
                                    x={-8} y={y} 
                                    dy="0.32em" 
                                    textAnchor="end" 
                                    fontSize="12" 
                                    fill="#6B7281"
                                >
                                    {Math.round(value)}
                                </text>
                            </g>
                        );
                    })}
                    
                    {/* Bars and X-Axis Labels */}
                    {data.map((item, index) => {
                        const barHeight = item.value > 0 ? (item.value / roundedMaxValue) * contentHeight : 0;
                        const x = index * (barWidth + barSpacing);
                        return (
                            <g key={item.name}>
                                <rect
                                    x={x + (barSpacing / 2)}
                                    y={contentHeight - barHeight}
                                    width={barWidth}
                                    height={barHeight}
                                    fill="#8B5CF6"
                                    className="opacity-70 hover:opacity-100 transition-opacity"
                                    onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, data: item })}
                                    onMouseLeave={() => setTooltip(null)}
                                />
                                <text 
                                    x={x + (barSpacing / 2) + barWidth / 2} 
                                    y={contentHeight + 15} 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fill="#6B7281"
                                >
                                    {item.name}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
            {tooltip && (
                <div className="fixed p-2 text-xs bg-gray-800 text-white rounded-md shadow-lg pointer-events-none" style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}>
                    <p className="font-bold">{tooltip.data.name}</p>
                    <p>{tooltip.data.value} agendamentos</p>
                </div>
            )}
        </div>
    );
};

export default SimpleBarChart;