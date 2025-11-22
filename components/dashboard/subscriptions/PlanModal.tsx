// components/dashboard/subscriptions/PlanModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import type { SubscriptionPlan, Service, ServiceRecipe, Material } from '../../../types';
import { CloseIcon, AlertTriangleIcon } from '../Icons';
import ToggleSwitch from '../ToggleSwitch';
import { calculateServiceCostBreakdown } from '../../../utils/pricing';

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: SubscriptionPlan) => void;
    planToEdit: Partial<SubscriptionPlan> | null;
    services: Service[];
    serviceRecipes: ServiceRecipe[];
    materials: Material[];
    costPerMinute: number;
}

const SAFETY_MARGIN = 0.15; // 15%

const PlanModal: React.FC<PlanModalProps> = (props) => {
    const { isOpen, onClose, onSave, planToEdit, services, serviceRecipes, materials, costPerMinute } = props;

    const [draftPlan, setDraftPlan] = useState<Partial<SubscriptionPlan>>({});

    useEffect(() => {
        setDraftPlan(
            planToEdit 
            ? { ...planToEdit }
            : { name: '', price: 0, period: 'monthly', includedServices: [], isPopular: false, features: [] }
        );
    }, [planToEdit, isOpen]);

    const serviceRecipesMap = useMemo(() => new Map(serviceRecipes.map(r => [r.serviceId, r])), [serviceRecipes]);
    const materialsMap = useMemo(() => new Map(materials.map(m => [m.id, m])), [materials]);

    const handleFieldChange = (field: keyof SubscriptionPlan, value: any) => {
        setDraftPlan(prev => ({ ...prev, [field]: value }));
    };

    const handleServiceQuantityChange = (serviceId: string, quantity: number) => {
        setDraftPlan(prev => {
            const existing = prev.includedServices?.find(s => s.serviceId === serviceId);
            let newIncludedServices;
            if (quantity > 0) {
                if (existing) {
                    newIncludedServices = prev.includedServices?.map(s => s.serviceId === serviceId ? { ...s, quantity } : s);
                } else {
                    newIncludedServices = [...(prev.includedServices || []), { serviceId, quantity }];
                }
            } else {
                newIncludedServices = prev.includedServices?.filter(s => s.serviceId !== serviceId);
            }
            return { ...prev, includedServices: newIncludedServices };
        });
    };

    const costAnalysis = useMemo(() => {
        const included = draftPlan.includedServices || [];
        if (included.length === 0) {
            return { totalOperationalCost: 0, suggestedMinimumPrice: 0 };
        }

        const totalOperationalCost = included.reduce((sum, item) => {
            const recipe = serviceRecipesMap.get(item.serviceId);
            if (!recipe) return sum;

            const { totalCost: serviceTotalCost } = calculateServiceCostBreakdown(recipe, materialsMap, costPerMinute);
            return sum + (serviceTotalCost * item.quantity);
        }, 0);

        const suggestedMinimumPrice = totalOperationalCost * (1 + SAFETY_MARGIN);

        return { totalOperationalCost, suggestedMinimumPrice };
    }, [draftPlan.includedServices, serviceRecipesMap, materialsMap, costPerMinute]);
    
    const profitAnalysis = useMemo(() => {
        const price = draftPlan.price || 0;
        const cost = costAnalysis.totalOperationalCost;
        const profit = price - cost;
        const margin = price > 0 ? (profit / price) * 100 : 0;
        return { profit, margin };
    }, [draftPlan.price, costAnalysis.totalOperationalCost]);

    const handleSave = () => {
        if (!draftPlan.name || (draftPlan.includedServices || []).length === 0) {
            alert("O nome do plano e pelo menos um serviço são obrigatórios.");
            return;
        }
        onSave(draftPlan as SubscriptionPlan);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl text-gray-800 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold">{draftPlan.id ? 'Editar' : 'Criar'} Plano de Assinatura</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>

                <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
                    {/* Left Column: Form */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Plano</label>
                                <input type="text" value={draftPlan.name} onChange={e => handleFieldChange('name', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Período</label>
                                <select value={draftPlan.period} onChange={e => handleFieldChange('period', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                                    <option value="monthly">Mensal</option>
                                    <option value="yearly">Anual</option>
                                </select>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Preço Final de Venda (R$)</label>
                            <input type="number" value={draftPlan.price} onChange={e => handleFieldChange('price', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                        </div>
                        <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                            <label className="font-medium text-gray-700">Marcar como "Mais Popular"</label>
                            <ToggleSwitch enabled={draftPlan.isPopular || false} onChange={val => handleFieldChange('isPopular', val)} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Serviços Inclusos (quantidade por período)</h4>
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1 bg-gray-50">
                                {services.map(s => {
                                    const hasRecipe = serviceRecipesMap.has(s.id);
                                    const quantity = draftPlan.includedServices?.find(item => item.serviceId === s.id)?.quantity || 0;
                                    return (
                                        <div key={s.id} className={`flex items-center gap-3 p-2 rounded-md ${!hasRecipe ? 'opacity-50' : ''}`} title={!hasRecipe ? "Serviço sem receita de custo. Não pode ser adicionado." : ""}>
                                            <div className="flex-grow">
                                                <p className="font-medium">{s.name}</p>
                                                <p className="text-xs text-gray-500">Custo individual: R$ {(calculateServiceCostBreakdown(serviceRecipesMap.get(s.id)!, materialsMap, costPerMinute).totalCost).toFixed(2)}</p>
                                            </div>
                                            <input type="number" min="0" value={quantity} onChange={e => handleServiceQuantityChange(s.id, parseInt(e.target.value) || 0)} disabled={!hasRecipe} className="w-20 px-2 py-1 bg-white border border-gray-300 rounded-md text-right"/>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {/* Right Column: Analysis */}
                     <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200 space-y-3 h-fit sticky top-0">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Análise de Custo e Rentabilidade</h3>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Custo Operacional Total</span><span className="font-semibold">R$ {costAnalysis.totalOperationalCost.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Preço Mínimo Sugerido (15% margem)</span><span className="font-semibold">R$ {costAnalysis.suggestedMinimumPrice.toFixed(2)}</span></div>
                        
                        {draftPlan.price! < costAnalysis.suggestedMinimumPrice && (
                            <div className="p-2 bg-yellow-100 text-yellow-800 text-xs rounded-md flex items-center gap-2">
                                <AlertTriangleIcon className="w-4 h-4" />
                                <span>O preço de venda está abaixo do mínimo sugerido.</span>
                            </div>
                        )}
                        
                        <div className={`flex justify-between font-bold text-lg pt-2 border-t ${profitAnalysis.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}><span>Lucro / Prejuízo</span><span>R$ {profitAnalysis.profit.toFixed(2)}</span></div>
                        <div className={`flex justify-between font-semibold ${profitAnalysis.margin >= 0 ? 'text-green-500' : 'text-red-500'}`}><span>Margem de Lucro Final</span><span>{profitAnalysis.margin.toFixed(2)}%</span></div>
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 border-t flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600">
                        {draftPlan.id ? 'Salvar Alterações' : 'Salvar Plano'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default PlanModal;
