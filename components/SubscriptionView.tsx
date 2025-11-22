// components/SubscriptionView.tsx
import React from 'react';
import { ArrowLeftIcon, StarIcon } from './Icons';
import type { SubscriptionPlan } from '../types';

const SubscriptionView: React.FC<{ onBack: () => void, plans: SubscriptionPlan[] }> = ({ onBack, plans }) => {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800 p-4 sm:p-8">
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Nossos Planos</h3>
            </header>
            <div className="flex-grow overflow-y-auto pr-2 pb-4">
                 {plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Render plan cards here if they exist */}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <StarIcon className="w-16 h-16 text-gray-400 mb-4" />
                        <h4 className="text-lg font-semibold">Nenhum Plano Disponível</h4>
                        <p className="max-w-md">No momento não temos planos de assinatura. Fique de olho para novidades!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default SubscriptionView;