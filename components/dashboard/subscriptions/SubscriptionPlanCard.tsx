// components/dashboard/subscriptions/SubscriptionPlanCard.tsx
import React from 'react';
import type { SubscriptionPlan } from '../../../types';
import { CheckIcon, EditIcon, TrashIcon } from '../Icons';

interface SubscriptionPlanCardProps {
    plan: SubscriptionPlan;
    onEdit: () => void;
    onDelete: () => void;
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({ plan, onEdit, onDelete }) => {
    const periodText = plan.period === 'monthly' ? '/mês' : '/ano';
    const borderColor = plan.isPopular ? 'border-pink-500' : 'border-gray-200';
    const accentColor = plan.isPopular ? 'border-l-pink-500' : 'border-l-indigo-500';

    return (
        <div className={`relative flex flex-col bg-white/80 border ${borderColor} rounded-xl shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]`}>
            {plan.isPopular && (
                <div className="absolute -top-3 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    MAIS POPULAR
                </div>
            )}
            <div className={`p-6 border-l-4 ${accentColor} rounded-l-xl`}>
                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <div className="my-4">
                    <span className="text-3xl font-extrabold text-gray-900">R$ {plan.price.toFixed(2)}</span>
                    <span className="text-base font-medium text-gray-500">{periodText}</span>
                </div>
            </div>
            <div className="p-6 flex-grow">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">O QUE ESTÁ INCLUSO:</h4>
                <ul className="space-y-3 text-sm text-gray-700">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
             <div className="p-4 bg-gray-50/50 border-t rounded-b-xl flex justify-end gap-2">
                <button onClick={onEdit} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center gap-2"><EditIcon /> Editar</button>
                <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
            </div>
        </div>
    );
};

export default SubscriptionPlanCard;
