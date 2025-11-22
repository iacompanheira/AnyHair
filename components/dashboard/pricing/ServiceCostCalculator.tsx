import React, { useState, useMemo, useEffect } from 'react';
import type { Service, Material, ServiceRecipe } from '../../../types';
import { EditIcon, TrashIcon } from '../Icons';
import MaterialSelectionModal from './MaterialSelectionModal';
import HelpTooltip from './HelpTooltip';
import { calculateServiceCostBreakdown } from '../../../utils/pricing';
import ToggleSwitch from '../ToggleSwitch';


interface ServiceCostCalculatorProps {
    recipe: ServiceRecipe;
    allRecipes: ServiceRecipe[];
    materials: Material[];
    services: Service[];
    onSave: (recipe: ServiceRecipe, serviceInfo?: { name: string; duration: number, useRounding: boolean }) => void;
    onCancel: () => void;
    costPerMinute: number;
}

const ServiceCostCalculator: React.FC<ServiceCostCalculatorProps> = ({ recipe: initialRecipe, allRecipes, materials, services, onSave, onCancel, costPerMinute }) => {
    const [recipe, setRecipe] = useState<ServiceRecipe>(initialRecipe);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [simulatedPrice, setSimulatedPrice] = useState<string>('');
    const isNewServiceMode = initialRecipe.serviceId === '__NEW_SERVICE__';

    // Unified state for service info
    const [serviceName, setServiceName] = useState('');
    const [serviceDuration, setServiceDuration] = useState(30);
    const [serviceUseRounding, setServiceUseRounding] = useState(true);

    useEffect(() => {
        if (isNewServiceMode) {
            setServiceName('');
            setServiceDuration(initialRecipe.executionTime || 30);
            setServiceUseRounding(true);
        } else {
            const service = services.find(s => s.id === initialRecipe.serviceId);
            if (service) {
                setServiceName(service.name);
                setServiceDuration(service.duration);
                setServiceUseRounding(service.useRounding);
            }
        }
    }, [initialRecipe, services, isNewServiceMode]);

    // Sync recipe's execution time with service duration
    useEffect(() => {
        handleFieldChange('executionTime', serviceDuration);
    }, [serviceDuration]);
    
    const materialsMap = useMemo(() => 
        new Map(materials.map(m => [m.id, m]))
    , [materials]);

    const calculations = useMemo(() => {
        const { costOfMaterialsPerService, costWithAdditionals, laborCost, totalCost } = calculateServiceCostBreakdown(recipe, materialsMap, costPerMinute);
        
        const profitMargin = Math.max(0, Math.min(0.99, recipe.profitMarginPercent / 100)); // Avoid division by zero or negative profit
        const finalSalePrice = profitMargin < 1 ? totalCost / (1 - profitMargin) : totalCost;

        const grossProfit = finalSalePrice - totalCost;
        const isProfitable = grossProfit > 0;

        return { costOfMaterialsPerService, costWithAdditionals, laborCost, totalCost, finalSalePrice, grossProfit, isProfitable };

    }, [recipe, materialsMap, costPerMinute]);
    
    const simulatedProfitMargin = useMemo(() => {
        const price = parseFloat(simulatedPrice);
        if (isNaN(price) || price <= 0 || calculations.totalCost <= 0) return null;
        if (price < calculations.totalCost) return ((price / calculations.totalCost) - 1) * 100;
        return (1 - (calculations.totalCost / price)) * 100;
    }, [simulatedPrice, calculations.totalCost]);

    useEffect(() => {
        setSimulatedPrice(calculations.finalSalePrice.toFixed(2));
    }, [calculations.finalSalePrice]);

    const handleFieldChange = (field: keyof ServiceRecipe, value: string | number) => {
        setRecipe(prev => ({ ...prev, [field]: value }));
    };

    const handleMaterialsSave = (newMaterials: { materialId: string; quantity: number }[]) => {
        setRecipe(prev => ({ ...prev, materialsUsed: newMaterials }));
        setIsModalOpen(false);
    };

    const removeMaterial = (materialId: string) => {
        setRecipe(prev => ({...prev, materialsUsed: prev.materialsUsed.filter(m => m.materialId !== materialId) }));
    };

    const handleSaveClick = () => {
        if (!serviceName.trim()) {
            alert("O nome do serviço é obrigatório.");
            return;
        }
        onSave(recipe, { name: serviceName, duration: serviceDuration, useRounding: serviceUseRounding });
    };

    return (
        <div className="bg-white/95 border border-gray-200 p-6 rounded-xl shadow-sm max-w-4xl mx-auto text-gray-800">
            {isModalOpen && (
                <MaterialSelectionModal 
                    allMaterials={materials}
                    initialSelected={recipe.materialsUsed}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleMaterialsSave}
                />
            )}
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Calculadora de Custo de Serviço</h2>

            {/* Seção 1: Informações do Serviço (UNIFIED) */}
            <div className="mb-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">1. Informações do Serviço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="serviceName" className="block text-sm font-medium text-gray-600 mb-1">Nome do Serviço</label>
                        <input type="text" id="serviceName" value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" />
                    </div>
                    <div>
                        <label htmlFor="serviceDuration" className="block text-sm font-medium text-gray-600 mb-1">Duração (min)</label>
                        <input type="number" id="serviceDuration" value={serviceDuration} onChange={(e) => setServiceDuration(parseInt(e.target.value, 10) || 0)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" />
                    </div>
                </div>
                <div className="flex justify-between items-center bg-gray-200/50 p-3 rounded-md mt-4">
                    <div>
                        <label className="font-medium text-gray-700">Arredondar Preço</label>
                        <p className="text-xs text-gray-500">Arredonda o preço final para um valor comercial (ex: 9,90).</p>
                    </div>
                    <ToggleSwitch enabled={serviceUseRounding} onChange={setServiceUseRounding} />
                </div>
            </div>

            {/* Seção 2: Seleção de Materiais */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">2. Seleção de Materiais</h3>
                <button onClick={() => setIsModalOpen(true)} className="w-full mb-4 px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">
                    ADICIONAR MATERIAIS E QUANTIDADES
                </button>
                <div className="space-y-2">
                    {recipe.materialsUsed.map(item => {
                        const material = materialsMap.get(item.materialId);
                        if (!material) return null;
                        const cost = (item.quantity / material.packageSize) * material.packagePrice;
                        return (
                            <div key={item.materialId} className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{item.quantity}{material.unit} de {material.name}</p>
                                    <p className="text-sm text-gray-500">Custo: R$ {cost.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsModalOpen(true)} className="p-1.5 text-gray-500 hover:text-blue-600"><EditIcon /></button>
                                    <button onClick={() => removeMaterial(item.materialId)} className="p-1.5 text-gray-500 hover:text-red-500"><TrashIcon /></button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Seção 3: Parâmetros de Cálculo */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">3. Parâmetros de Cálculo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'executionTime', label: 'Tempo de Execução (min)', tooltip: 'Duração que o profissional leva para realizar o serviço. Sincronizado com a Duração do Serviço.', disabled: true },
                        { id: 'yields', label: 'Rendimento', tooltip: 'Quantos serviços uma única receita rende (ex: uma mistura de coloração pode servir para 2 aplicações de raiz). Padrão é 1.' },
                        { id: 'additionalCostsPercent', label: 'Custos Adicionais (%)', tooltip: 'Percentual sobre o custo dos materiais para cobrir itens não listados (água, energia, toalhas, etc.).' },
                        { id: 'safetyMarginPercent', label: 'Margem de Segurança (%)', tooltip: 'Percentual sobre o custo total (materiais + mão de obra) para proteger contra flutuações de preço e perdas.' },
                        { id: 'profitMarginPercent', label: 'Lucro Esperado (%)', tooltip: 'A margem de lucro final desejada. O preço de venda é calculado como: Custo Total / (1 - %Lucro).' },
                    ].map(field => (
                        <div key={field.id}>
                            <label htmlFor={field.id} className="flex items-center text-sm font-medium text-gray-600 mb-1">
                                {field.label} <HelpTooltip text={field.tooltip} />
                            </label>
                            <input
                                type="number" id={field.id}
                                value={(recipe as any)[field.id]}
                                onChange={e => handleFieldChange(field.id as keyof ServiceRecipe, parseFloat(e.target.value) || 0)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 ${field.disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`}
                                disabled={field.disabled}
                            />
                        </div>
                    ))}
                     <div>
                        <label className="flex items-center text-sm font-medium text-gray-600 mb-1">Custo da Mão de Obra (R$/min)<HelpTooltip text="Custo por minuto do profissional. Este valor é calculado dinamicamente na aba 'Configuração de Custos'."/></label>
                        <input type="number" value={costPerMinute.toFixed(2)} disabled className="w-full px-3 py-2 bg-gray-200 border-gray-300 rounded-md text-gray-500 cursor-not-allowed"/>
                    </div>
                </div>
            </div>

            {/* Seção 4 & 5: Resumo e Simulador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Resumo */}
                <div className={`p-4 rounded-lg border-2 bg-white ${calculations.isProfitable ? 'border-green-500' : 'border-red-500'}`}>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Resumo da Precificação</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Custo de Materiais</span><span>R$ {calculations.costOfMaterialsPerService.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Custo com Adicionais</span><span>R$ {calculations.costWithAdditionals.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Custo por Mão de Obra</span><span>R$ {calculations.laborCost.toFixed(2)}</span></div>
                        <div className="flex justify-between font-semibold pt-2 border-t border-gray-200"><span className="text-gray-700">Custo Total (c/ Segurança)</span><span>R$ {calculations.totalCost.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200"><span className="text-pink-500">Preço de Venda Final</span><span className="text-pink-500">R$ {calculations.finalSalePrice.toFixed(2)}</span></div>
                        <div className={`flex justify-between font-semibold ${calculations.isProfitable ? 'text-green-600' : 'text-red-600'}`}><span>Lucro Bruto Sugerido</span><span>R$ {calculations.grossProfit.toFixed(2)}</span></div>
                    </div>
                </div>
                {/* Simulador */}
                <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Simulador "E se?"</h3>
                    <p className="text-xs text-gray-500 mb-3">Altere o preço de venda para ver a margem de lucro resultante.</p>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-600 mb-1">Preço de Venda (R$)</label>
                            <input type="number" value={simulatedPrice} onChange={e => setSimulatedPrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"/>
                        </div>
                        <div className="flex-1">
                             <label className="text-sm font-medium text-gray-600 mb-1">Margem de Lucro (%)</label>
                             <div className={`w-full px-3 py-2 bg-gray-200 rounded-md font-bold text-lg text-center ${simulatedProfitMargin === null ? 'text-gray-700' : simulatedProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {simulatedProfitMargin !== null ? `${simulatedProfitMargin.toFixed(2)}%` : '-'}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção 6: Ações Finais */}
            <div className="flex justify-end gap-4">
                <button onClick={onCancel} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={handleSaveClick} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">Salvar Receita</button>
            </div>
        </div>
    );
};

export default ServiceCostCalculator;