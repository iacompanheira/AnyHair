
import React from 'react';
import { DocumentTextIcon } from './Icons';

interface ManualScheduleButtonProps {
    onClick: () => void;
}

const ManualScheduleButton: React.FC<ManualScheduleButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="relative group mt-6 flex items-center gap-2 px-6 py-3 bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-pink-500/40 hover:border-pink-500/80 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] overflow-hidden active:scale-95"
        >
            {/* Content Layer */}
            <div className="relative z-10 flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" />
                <span className="text-white/90 group-hover:text-white text-xs font-bold tracking-widest uppercase transition-colors">Agendamento Manual</span>
            </div>
            
            {/* Light Ray Sheen Effect Layer - applied via CSS class in index.html */}
            <div className="animate-sheen absolute inset-0 z-0"></div>
        </button>
    );
};

export default ManualScheduleButton;
