import React from 'react';
import { InfoIcon } from '../Icons';

const HelpTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative flex items-center ml-1.5">
        <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-gray-700 text-white text-xs rounded-lg p-2.5 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            {text}
        </div>
    </div>
);

export default HelpTooltip;
