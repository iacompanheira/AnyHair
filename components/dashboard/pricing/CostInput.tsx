// components/dashboard/pricing/CostInput.tsx
import React from 'react';
import HelpTooltip from './HelpTooltip';

interface CostInputProps {
    label: string;
    value: number;
    onChange: (value: string) => void;
    tooltip: string;
    type?: 'currency' | 'percent' | 'number';
}

const CostInput: React.FC<CostInputProps> = ({ label, value, onChange, tooltip, type = 'number' }) => {
    return (
        <div>
            <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                {label}
                <HelpTooltip text={tooltip} />
            </label>
            <div className="relative">
                {type === 'currency' && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R$</span>}
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500
                        ${type === 'currency' ? 'pl-10 pr-3' : ''}
                        ${type === 'percent' ? 'pr-10 pl-3' : ''}
                        ${type === 'number' ? 'px-3' : ''}
                    `}
                />
                {type === 'percent' && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>}
            </div>
        </div>
    );
};

export default CostInput;
