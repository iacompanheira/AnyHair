

import React from 'react';

interface DashboardCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, description, onClick }) => (
    <div onClick={onClick} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-pink-400 hover:scale-105 shadow-sm hover:shadow-lg">
        <div className="w-8 h-8 text-pink-500 mb-1.5">{icon}</div>
        <h3 className="text-sm font-semibold text-gray-800 mb-0.5 leading-tight">{title}</h3>
        <p className="text-gray-500 text-xs leading-snug">{description}</p>
    </div>
);

export default DashboardCard;