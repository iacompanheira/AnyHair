// components/dashboard/subscriptions/SubscriptionManager.tsx
import React, { useState, useMemo } from 'react';
import type { SubscriptionPlan, Service, ServiceRecipe, Material } from '../../../types';
import { PlusIcon, ArrowLeftIcon, StarIcon } from '../Icons';
import PlanModal from './PlanModal';
import ConfirmationModal from '../pricing/ConfirmationModal';
import SubscriptionPlanCard from './SubscriptionPlanCard';
import { generateUUID } from '../../../utils/date';

interface SubscriptionManagerProps {
    subscriptionPlans: SubscriptionPlan[];
    onSubscriptionPlansChange: (plans: SubscriptionPlan[]) => void;
    services: Service[];
    serviceRecipes: ServiceRecipe[];
    materials: Material[];
    costPerMinute: number;
    onBack: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = (props) => {
    const { subscriptionPlans, onSubscriptionPlansChange, services, onBack } = props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<SubscriptionPlan | null>(null);
    const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

    const servicesMap = useMemo(() => new Map(services.map(s => [s.id, s])), [services]);

    const handleOpenAddModal = () => {
        setPlanToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plan: SubscriptionPlan) => {
        setPlanToEdit(plan);
        setIsModalOpen(true);
    };

    const handleOpenConfirmModal = (plan: SubscriptionPlan) => {
        setPlanToDelete(plan);
        setIsConfirmOpen(true);
    };

    const handleSavePlan = (planData: SubscriptionPlan) => {
        const features: string[] = [];
        const included = planData.includedServices || [];
        
        included.forEach(item => {
            const service = servicesMap.get(item.serviceId);
            if (service) {
                features.push(`${item.quantity}x ${service.name} por mês`);
            }
        });
        
        const planWithFeatures = { ...planData, features };

        if (planWithFeatures.id) {
            onSubscriptionPlansChange(subscriptionPlans.map(p => p.id === planWithFeatures.id ? planWithFeatures : p));
        } else {
            onSubscriptionPlansChange([...subscriptionPlans, { ...planWithFeatures, id: generateUUID() }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (planToDelete) {
            onSubscriptionPlansChange(subscriptionPlans.filter(p => p.id !== planToDelete.id));
            setIsConfirmOpen(false);
            setPlanToDelete(null);
        }
    };
    
    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full text-gray-800">
            {isModalOpen && (
                <PlanModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSavePlan}
                    planToEdit={planToEdit}
                    {...props}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja apagar o plano "${planToDelete?.name}"? Esta ação não pode ser desfeita.`}
            />

            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Gerenciamento de Planos de Assinatura</h3>
                <div className="flex-grow"></div>
                <button onClick={handleOpenAddModal} className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2">
                    <PlusIcon /> Adicionar Plano
                </button>
            </header>

            <div className="flex-grow overflow-y-auto pr-2 pb-4">
                {subscriptionPlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subscriptionPlans.map(plan => (
                            <SubscriptionPlanCard 
                                key={plan.id}
                                plan={plan}
                                onEdit={() => handleOpenEditModal(plan)}
                                onDelete={() => handleOpenConfirmModal(plan)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 border-2 border-dashed rounded-xl">
                        <StarIcon className="w-16 h-16 text-gray-400 mb-4" />
                        <h4 className="text-lg font-semibold">Nenhum Plano de Assinatura Criado</h4>
                        <p className="max-w-md">Clique em "Adicionar Plano" para criar seu primeiro plano de serviços recorrentes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionManager;
