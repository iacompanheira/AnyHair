import React, { useState, useEffect } from 'react';
import { 
    CalendarIcon, ClipboardListIcon, UsersIcon, ClockIcon, 
    StarIcon, TagIcon, PhoneIcon, ImageIcon,
    ChevronLeftIcon, ChevronRightIcon
} from './Icons';

interface FloatingActionButtonsProps {
    onButtonClick: (view: string) => void;
}

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; id: string; }> = ({ icon, label, onClick, id }) => (
    <button 
        id={id}
        onClick={onClick} 
        className="w-12 h-12 bg-pink-500/80 backdrop-blur-md rounded-xl flex items-center justify-center ring-1 ring-white/20 hover:bg-pink-500 shadow-lg transition-colors transform hover:scale-105"
        aria-label={label}
    >
        <div className="w-6 h-6 text-white">{icon}</div>
    </button>
);


const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({ onButtonClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [topPosition, setTopPosition] = useState<number | undefined>(undefined);

    useEffect(() => {
        const updatePosition = () => {
            const ctaButton = document.getElementById('cta-button');
            if (ctaButton) {
                const rect = ctaButton.getBoundingClientRect();
                // Position the sidebar 8px below the CTA button.
                const newTop = rect.bottom + 8;
                setTopPosition(newTop);
            }
        };

        // A small delay to ensure the CTA button is rendered and its position is stable.
        const timer = setTimeout(updatePosition, 100);
        
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, []);

    const buttons = [
        { icon: <CalendarIcon className="w-full h-full"/>, label: "Agenda", view: 'appointments' },
        { icon: <ClipboardListIcon className="w-full h-full"/>, label: "Serviços", view: 'services' },
        { icon: <UsersIcon className="w-full h-full"/>, label: "Equipe", view: 'team' },
        { icon: <ClockIcon className="w-full h-full"/>, label: "Horários", view: 'hours' },
        { icon: <StarIcon className="w-full h-full"/>, label: "Planos", view: 'subscriptions' },
        { icon: <TagIcon className="w-full h-full"/>, label: "Promoções", view: 'services' },
        { icon: <PhoneIcon className="w-full h-full"/>, label: "Contato", view: 'contact' },
        { icon: <ImageIcon className="w-full h-full"/>, label: "Galeria", view: 'gallery' }
    ];

    return (
        <div
            id="floating-action-buttons-container"
            className="fixed right-0 z-20 transition-all duration-300 ease-in-out"
            style={{
                top: topPosition ? `${topPosition}px` : '50%', // Use calculated top position
                opacity: topPosition ? 1 : 0, // Hide until position is calculated to avoid flash
                transform: isOpen ? 'translateX(0%)' : `translateX(calc(100% - 40px))`,
            }}
            aria-hidden={!isOpen}
        >
            <div className="flex items-center bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl rounded-l-2xl">
                {/* Handle to open/close */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-24 flex items-center justify-center text-white/80 hover:text-white flex-shrink-0"
                    aria-label={isOpen ? 'Fechar menu de ações' : 'Abrir menu de ações'}
                    aria-expanded={isOpen}
                >
                    {isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </button>

                {/* Button Grid */}
                <div className="p-3 border-l border-white/10">
                    <div className="grid grid-cols-4 gap-3">
                        {buttons.map(button => (
                            <ActionButton
                                key={button.label}
                                icon={button.icon}
                                label={button.label}
                                onClick={() => onButtonClick(button.view)}
                                id={`fab-${button.view}-button`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FloatingActionButtons;
