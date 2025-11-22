// components/dashboard/subscriptions/PlanTierModal.tsx
import React, { useState, useMemo } from 'react';
import type { SubscriptionTier, AppFeature } from '../../../types';
import { CloseIcon } from '../Icons';

interface PlanTierModalProps {
    tierToEdit: Partial<SubscriptionTier>;
    allFeatures: AppFeature[];
    onClose: () => void;
    onSave: (tier: SubscriptionTier) => void;
}

const PlanTierModal: React.FC<PlanTierModalProps> = ({ tierToEdit, allFeatures, onClose, onSave }) => {
    const [draft, setDraft] = useState(tierToEdit);

    const regularFeatures = useMemo(() => allFeatures.filter(f => f.type === 'feature'), [allFeatures]);
    const kpis = useMemo(() => allFeatures.filter(f => f.type === 'kpi'), [allFeatures]);

    const handleFeatureToggle = (featureId: string) => {
        setDraft(prev => {
            const currentFeatures = prev.enabledFeatures || [];
            const newFeatures = currentFeatures.includes(featureId)
                ? currentFeatures.filter(id => id !== featureId)
                : [...currentFeatures, featureId];
            return { ...prev, enabledFeatures: newFeatures };
        });
    };

    const handleSave = () => {
        if (!draft.name?.trim()) {
            alert("O nome do plano é obrigatório.");
            return;
        }
        onSave(draft as SubscriptionTier);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl text-gray-800 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{draft.id ? 'Editar' : 'Novo'} Plano</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Plano</label>
                            <input
                                type="text"
                                value={draft.name || ''}
                                onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Preço Mensal (R$)</label>
                            <input
                                type="number"
                                value={draft.price || 0}
                                onChange={e => setDraft(d => ({ ...d, price: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Recursos Inclusos</h4>
                        <div className="space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50">
                            {regularFeatures.map(feature => (
                                <label key={feature.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={(draft.enabledFeatures || []).includes(feature.id)}
                                        onChange={() => handleFeatureToggle(feature.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 mt-1"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-800">{feature.name}</span>
                                        <p className="text-xs text-gray-500">{feature.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="text-md font-semibold text-gray-700 mb-2">KPIs Inclusos</h4>
                        <div className="space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50">
                            {kpis.map(kpi => (
                                <label key={kpi.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={(draft.enabledFeatures || []).includes(kpi.id)}
                                        onChange={() => handleFeatureToggle(kpi.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 mt-1"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-800">{kpi.name}</span>
                                        <p className="text-xs text-gray-500">{kpi.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <footer className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600">Salvar Plano</button>
                </footer>
            </div>
        </div>
    );
};

export default PlanTierModal;