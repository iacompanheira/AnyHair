import React from 'react';
import type { CTAButtonSettings } from '../types';
import { darken, hexToRgba } from '../utils/colors';

interface CTAButtonProps {
    settings: CTAButtonSettings;
    onClick: () => void;
    disabled?: boolean;
}

const CTAButton: React.FC<CTAButtonProps> = ({ settings, onClick, disabled = false }) => {
    if (!settings.enabled) return null;

    const mainColor = settings.buttonColor;
    const darkerColor = darken(mainColor, -20);
    const evenDarkerColor = darken(mainColor, -40);
    const shadowColor = hexToRgba(mainColor, 0.35);

    const buttonId = "cta-button";

    // These dynamic styles allow for hover and active states that depend on the chosen colors.
    const dynamicStyles = `
        #${buttonId}:not(:disabled) {
            /* Base state: A clear 3D effect with a "thickness" and a "glow" */
            background-color: ${mainColor};
            background-image: linear-gradient(to bottom, ${mainColor}, ${darkerColor});
            box-shadow: 0 5px 0 0 ${evenDarkerColor}, 0 8px 15px -4px ${shadowColor};
            transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, filter 0.15s ease-out;
            transform: translateY(0);
        }
        #${buttonId}:not(:disabled):hover {
            /* Hover state: Lifts the button up and expands the shadow for an inviting feel */
            transform: translateY(-3px);
            box-shadow: 0 7px 0 0 ${evenDarkerColor}, 0 12px 20px -4px ${shadowColor};
        }
        #${buttonId}:not(:disabled):active {
            /* Active state: Pushes the button down and shrinks the shadow for a satisfying click feedback */
            transform: translateY(2px);
            box-shadow: 0 2px 0 0 ${evenDarkerColor}, 0 4px 8px -2px ${shadowColor};
        }
    `;

    return (
        <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 animate-fade-in">
            {/* Inject the dynamic styles directly into the DOM */}
            <style>{dynamicStyles}</style>
            <button
                id={buttonId}
                onClick={onClick}
                disabled={disabled}
                className={`px-8 py-5 font-bold tracking-wide rounded-xl whitespace-nowrap animate-glow-perpetual ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                    color: settings.textColor,
                    fontSize: `${settings.fontSize}px`,
                    textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                }}
            >
                {settings.buttonText}
            </button>
        </div>
    );
};

export default CTAButton;
