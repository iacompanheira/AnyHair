
import React, { PropsWithChildren } from 'react';
import type { TitleSettings, HeaderSettings } from '../types';
import { MenuIcon, BriefcaseIcon } from './Icons';

const IconWrapper: React.FC<PropsWithChildren<{ onClick?: () => void, id?: string }>> = ({ children, onClick, id }) => (
    <button id={id} onClick={onClick} className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-pink-500 hover:bg-pink-600 active:scale-95 shadow-md">
        {children}
    </button>
);

interface HeaderProps {
    onMenuClick: () => void;
    onStaffAccessClick: () => void;
    titleSettings: TitleSettings;
    headerSettings: HeaderSettings;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onStaffAccessClick, titleSettings, headerSettings }) => (
    <header 
        className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 backdrop-blur-sm transition-all duration-300"
        style={{
            backgroundColor: `${headerSettings.backgroundColor}${Math.round(headerSettings.opacity * 255).toString(16).padStart(2, '0')}`,
            height: `${headerSettings.height}px`,
        }}
    >
        <h1 className="tracking-wider" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {titleSettings.parts.map((part, index) => (
                <span key={index} style={{
                    color: part.color,
                    fontSize: `${part.fontSize}px`,
                    fontWeight: part.fontWeight,
                    fontStyle: part.fontStyle,
                }}>{part.text}</span>
            ))}
        </h1>
        <div className="flex items-center gap-3">
            <IconWrapper id="header-staff-button" onClick={onStaffAccessClick}><BriefcaseIcon /></IconWrapper>
            <IconWrapper id="header-dashboard-button" onClick={onMenuClick}><MenuIcon /></IconWrapper>
        </div>
    </header>
);

export default Header;
