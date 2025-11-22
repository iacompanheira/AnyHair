// components/dashboard/subscriptions/FeatureSubscriptionManager.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { SubscriptionSettings, SubscriptionTier } from '../../../types';
import { APP_FEATURES } from '../../../constants/initialData';
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon } from '../Icons';
import PlanTierModal from './PlanTierModal';
import SaveBar from '../SaveBar';
import { generateUUID } from '../../../utils/date';

interface FeatureSubscriptionManagerProps {
    settings: SubscriptionSettings;
    onSettingsChange: (settings: SubscriptionSettings) => void;
    onBack: () => void;
}

const FeatureSubscriptionManager: React.FC<FeatureSubscriptionManagerProps> = ({ settings, onSettingsChange, onBack }) => {
    const [draftSettings, setDraftSettings] = useState(settings);
    const [hasChanges, setHasChanges] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<Partial<SubscriptionTier> | null>(null);

    const { unassignedKpis, allKpis, allRegularFeatures } = useMemo(() => {
        const allKpis = APP_FEATURES.filter(f => f.type === 'kpi');
        const allRegularFeatures = APP_FEATURES.filter(f => f.type === 'feature');
        const allKpiIds = new Set(allKpis.map(f => f.id));

        const usedKpiIds = new Set<string>();
        draftSettings.availableTiers.forEach(tier => {
            tier.enabledFeatures.forEach(featureId => {
                if (allKpiIds.has(featureId)) {
                    usedKpiIds.add(featureId);
                }
            });
        });

        const unassignedKpis = allKpis.filter(kpi => !usedKpiIds.has(kpi.id));

        return { unassignedKpis, allKpis, allRegularFeatures };
    }, [draftSettings.availableTiers]);

    useEffect(() => {
        setHasChanges(JSON.stringify(draftSettings) !== JSON.stringify(settings));
    }, [draftSettings, settings]);

    const handleSaveChanges = () => {
        onSettingsChange(draftSettings);
        setHasChanges(false);
    };

    const handleCancelChanges = () => {
        setDraftSettings(settings);
    };

    const handleBack = () => {
        if (hasChanges) {
            if (window.confirm("Você tem alterações não salvas. Deseja descartá-las?")) {
                onBack();
            }
        } else {
            onBack();
        }
    };
    
    const handleAddNewTier = () => {
        setEditingTier({ name: '', price: 0, enabledFeatures: [] });
        setIsModalOpen(true);
    };
    
    const handleEditTier = (tier: SubscriptionTier) => {
        setEditingTier(tier);
        setIsModalOpen(true);
    };

    const handleDeleteTier = (tierId: string) => {
        if (tierId === draftSettings.activeTierId) {
            alert("Não é possível apagar o plano que está ativo no momento.");
            return;
        }
        if (window.confirm("Tem certeza que deseja apagar este plano?")) {
            setDraftSettings(prev => ({
                ...prev,
                availableTiers: prev.availableTiers.filter(t => t.id !== tierId)
            }));
        }
    };
    
    const handleSaveTier = (tierData: SubscriptionTier) => {
        if (tierData.id) { // Editing
            setDraftSettings(prev => ({
                ...prev,
                availableTiers: prev.availableTiers.map(t => t.id === tierData.id ? tierData : t)
            }));
        } else { // Adding
            setDraftSettings(prev => ({
                ...prev,
                availableTiers: [...prev.availableTiers, { ...tierData, id: generateUUID() }]
            }));
        }
        setIsModalOpen(false);
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800">
            {isModalOpen && editingTier && (
                <PlanTierModal 
                    tierToEdit={editingTier} 
                    allFeatures={APP_FEATURES} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSaveTier}
                />
            )}
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={handleBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Gestão de Planos e Recursos</h3>
            </header>

            <div className="flex-grow overflow-y-auto pr-2 pb-24 space-y-6">
                <div className="bg-white/80 border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Plano Ativo no Aplicativo</h4>
                    <p className="text-sm text-gray-500 mb-4">Selecione qual plano de assinatura está ativo. As funcionalidades do dashboard serão ajustadas dinamicamente.</p>
                    <select 
                        value={draftSettings.activeTierId} 
                        onChange={e => setDraftSettings(s => ({...s, activeTierId: e.target.value}))}
                        className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                        {draftSettings.availableTiers.map(tier => (
                            <option key={tier.id} value={tier.id}>{tier.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white/80 border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                         <h4 className="text-lg font-semibold text-gray-700">Planos Disponíveis</h4>
                         <button onClick={handleAddNewTier} className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 flex items-center gap-2"><PlusIcon/> Adicionar Plano</button>
                    </div>
                    {unassignedKpis.length > 0 && (
                        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
                            <p className="font-bold">KPIs não atribuídos a nenhum plano:</p>
                            <ul className="list-disc list-inside text-sm mt-1">
                                {unassignedKpis.map(kpi => <li key={kpi.id}>{kpi.name}</li>)}
                            </ul>
                        </div>
                    )}
                    <div className="space-y-4">
                        {draftSettings.availableTiers.map(tier => {
                            const includedFeatures = allRegularFeatures.filter(f => tier.enabledFeatures.includes(f.id));
                            const includedKpis = allKpis.filter(kpi => tier.enabledFeatures.includes(kpi.id));
                            return (
                                <div key={tier.id} className="border rounded-lg p-4 flex justify-between items-start">
                                    <div>
                                        <h5 className="font-bold text-lg">{tier.name}</h5>
                                        <p className="font-semibold text-pink-600">R$ {tier.price.toFixed(2)} / mês</p>

                                        {includedKpis.length > 0 && (
                                            <div className="mt-3">
                                                <h6 className="text-xs font-bold text-gray-500 uppercase">KPIs Inclusos</h6>
                                                <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                                                    {includedKpis.map(kpi => (
                                                        <li key={kpi.id}>{kpi.name.replace('KPI: ', '')}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {(includedFeatures.length > 0 || (includedKpis.length === 0 && includedFeatures.length === 0)) && (
                                            <div className="mt-3">
                                                <h6 className="text-xs font-bold text-gray-500 uppercase">Recursos Inclusos</h6>
                                                <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                                                    {includedFeatures.map(feature => (
                                                        <li key={feature.id}>{feature.name}</li>
                                                    ))}
                                                    {includedFeatures.length === 0 && includedKpis.length === 0 && (
                                                        <li className="text-gray-400 italic">Apenas recursos básicos</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEditTier(tier)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon/></button>
                                        <button onClick={() => handleDeleteTier(tier.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon/></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
            
            <SaveBar hasChanges={hasChanges} onSave={handleSaveChanges} onCancel={handleCancelChanges} />
        </div>
    );
};

export default FeatureSubscriptionManager;
