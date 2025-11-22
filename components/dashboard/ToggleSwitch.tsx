
import React from 'react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange }) => (
    <button onClick={() => onChange(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 ${enabled ? 'bg-pink-500' : 'bg-gray-300'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

export default ToggleSwitch;
