// components/dashboard/reports/ReportBlock.tsx
import React from 'react';

interface ReportBlockProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const ReportBlock: React.FC<ReportBlockProps> = ({ title, icon, children }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <div className="flex-grow flex items-center justify-center min-h-[250px]">
                {children}
            </div>
        </div>
    );
};

export default ReportBlock;
