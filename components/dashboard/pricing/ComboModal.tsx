import React, { useState, useMemo, useEffect } from 'react';
import type { Service, ServiceRecipe, Combo, Material } from '../../../types';
import { CloseIcon, AlertTriangleIcon } from '../Icons';
import ToggleSwitch from '../ToggleSwitch';
import { calculateServiceCostBreakdown } from '../../../utils/pricing';
import { applyCustomRounding } from '../../../utils/rounding';

interface ComboModalProps {
    comboToEdit: Partial<Combo> | null;
    allServices: Service[];
    allServiceRecipes: ServiceRecipe[];
    allMaterials: Material[];
    onClose: () => void;
    onSave: (combo: Combo) => void;
    costPerMinute: number;
}

const ComboModal: React.FC<ComboModalProps> = ({ comboToEdit, allServices, allServiceRecipes, allMaterials, onClose, onSave, costPerMinute }) => {
    const [combo, setCombo] = useState<Partial<Combo>>(
        comboToEdit && Object.keys(comboToEdit).length > 0
        ? { ...comboToEdit }
        : { name: '', serviceIds: [], finalPrice: 0, discount: 0, isVisibleInCatalog: true, useRounding: true }
    );

    const serviceRecipesMap = useMemo(() => new Map(allServiceRecipes.map(r => [r.serviceId, r])), [allServiceRecipes]);
    const materialsMap = useMemo(() => new Map(allMaterials.map(m => [m.id, m])), [allMaterials]);

    const handleServiceToggle = (serviceId: string) => {
        setCombo(prev => {
            const currentIds = prev.serviceIds || [];
            const newIds = currentIds.includes(serviceId)
                ? currentIds.filter(id => id !== serviceId)
                : [...currentIds, serviceId];
            return { ...prev, serviceIds: newIds };
        });
    };

    const calculations = useMemo(() => {
        const selectedServices = allServices.filter(s => combo.serviceIds?.includes(s.id));
        
        const sumOfIndividualPrices = selectedServices.reduce((sum, s) => sum + s.price, 0);
        
        const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

        const totalOperationalCost = selectedServices.reduce((sum, service) => {
            const recipe = serviceRecipesMap.get(service.id);
            if (!recipe) return sum;

            const { totalCost: serviceTotalCost } = calculateServiceCostBreakdown(
                recipe,
                materialsMap,
                costPerMinute
            );

            return sum + serviceTotalCost;
        }, 0);

        const netProfit = (combo.finalPrice || 0) - totalOperationalCost;
        const profitMargin = (combo.finalPrice && combo.finalPrice > 0) ? (netProfit / combo.finalPrice) * 100 : 0;
        const vpm = totalDuration > 0 ? netProfit / totalDuration : 0;

        return { sumOfIndividualPrices, totalDuration, totalOperationalCost, netProfit, profitMargin, vpm };
    }, [combo.serviceIds, combo.finalPrice, allServices, serviceRecipesMap, materialsMap, costPerMinute]);


    useEffect(() => {
        // Auto-update price based on discount when services/discount/rounding changes
        const { sumOfIndividualPrices } = calculations;
        const discount = combo.discount || 0;
        const baseFinalPrice = sumOfIndividualPrices * (1 - (discount / 100));

        const priceToSet = combo.useRounding ? applyCustomRounding(baseFinalPrice) : baseFinalPrice;
        
        setCombo(prev => ({ ...prev, finalPrice: priceToSet }));
    }, [combo.serviceIds, combo.discount, combo.useRounding]);


    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPrice = parseFloat(e.target.value) || 0;
        const { sumOfIndividualPrices } = calculations;
        const newDiscount = sumOfIndividualPrices > 0 ? ((sumOfIndividualPrices - newPrice) / sumOfIndividualPrices) * 100 : 0;
        setCombo(prev => ({ ...prev, finalPrice: newPrice, discount: newDiscount }));
    };

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDiscount = parseFloat(e.target.value) || 0;
        // The useEffect will handle the price update
        setCombo(prev => ({ ...prev, discount: newDiscount }));
    };

    const handleSave = () => {
        if (!combo.name || (combo.serviceIds || []).length < 1) {
            alert('Nome do pacote e ao menos um serviço são obrigatórios.');
            return;
        }
        onSave(combo as Combo);
    };
    
    const hasRecipe = (serviceId: string) => serviceRecipesMap.has(serviceId);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl text-gray-800 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold">{combo.id ? 'Editar' : 'Criar Novo'} Pacote</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
                    {/* Left Column: Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Pacote</label>
                            <input type="text" value={combo.name} onChange={e => setCombo(c => ({...c, name: e.target.value}))} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Serviços Inclusos no Pacote</h4>
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1 bg-gray-50">
                                {allServices.map(s => (
                                    <label key={s.id} className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 ${!hasRecipe(s.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} title={!hasRecipe(s.id) ? "Este serviço não possui uma receita de custo e não pode ser adicionado." : ""}>
                                        <input type="checkbox" checked={(combo.serviceIds || []).includes(s.id)} onChange={() => handleServiceToggle(s.id)} disabled={!hasRecipe(s.id)} className="h-4 w-4 rounded border-gray-300 text-pink-600"/>
                                        <div className="flex-grow">
                                            <p>{s.name}</p>
                                            <p className="text-xs text-gray-500">R$ {s.price.toFixed(2)} - {s.duration} min</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                         <div className="border-t pt-4 space-y-4">
                            <h4 className="text-md font-semibold text-gray-700">Precificação</h4>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Preço Final (R$)</label>
                                    <input type="number" value={combo.finalPrice?.toFixed(2) || '0.00'} onChange={handlePriceChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Desconto (%)</label>
                                    <input type="number" value={combo.discount?.toFixed(2) || '0.00'} onChange={handleDiscountChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                                </div>
                             </div>
                             <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                                <div>
                                    <label className="font-medium text-gray-700">Arredondar Preço Final</label>
                                    <p className="text-xs text-gray-500">Arredonda o preço para um valor comercial.</p>
                                </div>
                                <ToggleSwitch enabled={combo.useRounding || false} onChange={enabled => setCombo(c => ({...c, useRounding: enabled}))} />
                            </div>
                        </div>
                    </div>
                    {/* Right Column: Analysis */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3 h-fit sticky top-0">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Análise do Pacote</h3>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Soma dos Preços Avulsos</span><span className="font-semibold">R$ {calculations.sumOfIndividualPrices.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Custo Operacional Total</span><span className="font-semibold">R$ {calculations.totalOperationalCost.toFixed(2)}</span></div>
                        <div className={`flex justify-between font-bold text-lg pt-2 border-t ${calculations.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}><span>Lucro Líquido</span><span>R$ {calculations.netProfit.toFixed(2)}</span></div>
                        <div className={`flex justify-between font-semibold ${calculations.profitMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}><span>Margem de Lucro</span><span>{calculations.profitMargin.toFixed(2)}%</span></div>
                        <div className="flex justify-between text-sm pt-2 border-t"><span className="text-gray-500">Valor por Minuto (Lucro)</span><span className="font-semibold">R$ {calculations.vpm.toFixed(2)}</span></div>
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 border-t flex justify-between items-center flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleSave} className={`px-6 py-2 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 ${calculations.netProfit < 0 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-pink-500 hover:bg-pink-600'}`}>
                         {calculations.netProfit < 0 && <AlertTriangleIcon className="w-5 h-5"/>}
                        {combo.id ? 'Salvar Alterações' : 'Salvar Pacote'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ComboModal;