import React, { useState, useMemo } from 'react';
import type { Service, Material, ServiceRecipe, Combo } from '../../../types';
import { PlusIcon, TrashIcon, ArchiveBoxIcon, ArrowLeftIcon, EditIcon, CloseIcon, CalculatorIcon, HandThumbUpIcon } from '../Icons';
import ServiceCostCalculator from './ServiceCostCalculator';
import ConfirmationModal from './ConfirmationModal';
import ComboModal from './ComboModal';
import ToggleSwitch from '../ToggleSwitch';
import { calculateServiceCostBreakdown } from '../../../utils/pricing';
import { applyCustomRounding } from '../../../utils/rounding';
import { generateUUID } from '../../../utils/date';

interface ServicesAndPackagesPanelProps {
    services: Service[];
    onServicesChange: (services: Service[]) => void;
    materials: Material[];
    serviceRecipes: ServiceRecipe[];
    onServiceRecipesChange: (recipes: ServiceRecipe[]) => void;
    combos: Combo[];
    onCombosChange: (combos: Combo[]) => void;
    costPerMinute: number;
    onBack: () => void;
}

const ServicesAndPackagesPanel: React.FC<ServicesAndPackagesPanelProps> = ({ services, onServicesChange, materials, serviceRecipes, onServiceRecipesChange, combos, onCombosChange, costPerMinute, onBack }) => {
    // === STATE FOR VIEWS & MODALS ===
    const [view, setView] = useState<'list' | 'recipe_form'>('list');
    
    // Services
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
    const [deletingService, setDeletingService] = useState<Service | null>(null);

    // Recipes
    const [editingRecipe, setEditingRecipe] = useState<Partial<ServiceRecipe> | null>(null);

    // Combos
    const [isComboModalOpen, setIsComboModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState<Partial<Combo> | null>(null);
    const [deletingCombo, setDeletingCombo] = useState<Combo | null>(null);
    
    const materialsMap = useMemo(() => new Map(materials.map(m => [m.id, m])), [materials]);

    // === HANDLERS FOR SERVICES ===
    const handleAddNewService = () => {
        const newRecipePlaceholder: Partial<ServiceRecipe> = {
            id: '', 
            serviceId: '__NEW_SERVICE__', // Special key to denote a new service
            executionTime: 30, 
            yields: 1,
            materialsUsed: [], 
            additionalCostsPercent: 2, 
            safetyMarginPercent: 2, 
            profitMarginPercent: 30,
        };
        setEditingRecipe(newRecipePlaceholder);
        setView('recipe_form');
    };
    const handleEditService = (service: Service) => {
        setEditingService(service);
        setIsServiceModalOpen(true);
    };
    const handleSaveService = (serviceData: Partial<Service>) => {
        if (serviceData.id) { // Editing only
            const updatedServices = services.map(s => s.id === serviceData.id ? serviceData as Service : s);
            onServicesChange(updatedServices);
        }
        setIsServiceModalOpen(false);
    };
    const handleDeleteService = (service: Service) => {
        const combosUsingService = combos.filter(c => c.serviceIds.includes(service.id));
        if (combosUsingService.length > 0) {
            alert(`Este serviço não pode ser apagado pois está sendo usado nos pacotes: ${combosUsingService.map(c => c.name).join(', ')}.`);
            return;
        }
        setDeletingService(service);
    };
    const confirmDeleteService = () => {
        if (deletingService) {
            onServicesChange(services.filter(s => s.id !== deletingService.id));
            onServiceRecipesChange(serviceRecipes.filter(r => r.serviceId !== deletingService.id));
            setDeletingService(null);
        }
    };
    
    // === HANDLERS FOR RECIPES ===
    const handleManageRecipe = (service: Service) => {
        const recipe = serviceRecipes.find(r => r.serviceId === service.id);
        if (recipe) {
            setEditingRecipe(recipe);
        } else {
            setEditingRecipe({
                id: '', serviceId: service.id, executionTime: service.duration, yields: 1,
                materialsUsed: [], additionalCostsPercent: 2, safetyMarginPercent: 2, profitMarginPercent: 30,
            });
        }
        setView('recipe_form');
    };
    const handleSaveRecipeAndService = (recipeToSave: ServiceRecipe, serviceInfo?: { name: string; duration: number, useRounding: boolean }) => {
        let serviceList = [...services];
        let targetService: Service | undefined;

        if (serviceInfo && recipeToSave.serviceId === '__NEW_SERVICE__') {
            // It's a brand new service
            targetService = {
                id: generateUUID(),
                name: serviceInfo.name,
                duration: serviceInfo.duration,
                price: 0, // Will be calculated
                useManualPrice: false, // New services start as auto-priced
                useRounding: serviceInfo.useRounding,
            };
            serviceList.push(targetService);
            recipeToSave.serviceId = targetService.id; // Link recipe to the new service ID
        } else {
            // Find the existing service to potentially update
            let serviceToUpdate = serviceList.find(s => s.id === recipeToSave.serviceId);
            if (serviceToUpdate && serviceInfo) {
                // Update existing service details if new info is provided
                serviceToUpdate = {
                    ...serviceToUpdate,
                    name: serviceInfo.name,
                    duration: serviceInfo.duration,
                    useRounding: serviceInfo.useRounding,
                };
                serviceList = serviceList.map(s => s.id === serviceToUpdate!.id ? serviceToUpdate : s);
            }
            targetService = serviceToUpdate;
        }

        if (!targetService) {
            console.error("Could not find or create service to save recipe.");
            setView('list');
            return;
        }

        // Save the recipe
        const updatedRecipes = recipeToSave.id 
            ? serviceRecipes.map(r => r.id === recipeToSave.id ? recipeToSave : r)
            : [...serviceRecipes, { ...recipeToSave, id: generateUUID() }];
        onServiceRecipesChange(updatedRecipes);

        // Update the service price if it's not manual
        if (!targetService.useManualPrice) {
            const { totalCost } = calculateServiceCostBreakdown(recipeToSave, materialsMap, costPerMinute);
            const profitMargin = Math.max(0, Math.min(0.99, recipeToSave.profitMarginPercent / 100));
            const baseSalePrice = profitMargin < 1 ? totalCost / (1 - profitMargin) : totalCost;

            const priceToSet = targetService.useRounding ? applyCustomRounding(baseSalePrice) : baseSalePrice;
            
            const finalUpdatedService = { ...targetService, price: priceToSet };
            serviceList = serviceList.map(s => s.id === finalUpdatedService.id ? finalUpdatedService : s);
        }
        
        onServicesChange(serviceList);
        setView('list');
    };
    
    // === HANDLERS FOR COMBOS ===
    const handleAddNewCombo = () => { setEditingCombo({ useRounding: true }); setIsComboModalOpen(true); };
    const handleEditCombo = (combo: Combo) => { setEditingCombo(combo); setIsComboModalOpen(true); };
    const handleDuplicateCombo = (combo: Combo) => {
        const { id, ...duplicatedCombo } = combo;
        setEditingCombo({ ...duplicatedCombo, name: `${combo.name} (Cópia)` });
        setIsComboModalOpen(true);
    };
    const handleDeleteCombo = (combo: Combo) => setDeletingCombo(combo);
    const confirmDeleteCombo = () => {
        if (deletingCombo) {
            onCombosChange(combos.filter(c => c.id !== deletingCombo.id));
            setDeletingCombo(null);
        }
    };
    const handleSaveCombo = (comboToSave: Combo) => {
        const updatedCombos = comboToSave.id
            ? combos.map(c => c.id === comboToSave.id ? comboToSave : c)
            : [...combos, { ...comboToSave, id: generateUUID() }];
        onCombosChange(updatedCombos);
        setIsComboModalOpen(false);
    };

    const effectiveOnBack = view === 'list' ? onBack : () => setView('list');
    const title = view === 'list' 
        ? 'Precificação de Serviços e Pacotes' 
        : (editingRecipe?.id ? 'Editar Receita de Custo' : 'Criar Novo Serviço e Receita');

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800">
            {isServiceModalOpen && (
                <ServiceModal 
                    service={editingService} 
                    onClose={() => setIsServiceModalOpen(false)} 
                    onSave={handleSaveService}
                    serviceRecipes={serviceRecipes}
                    materialsMap={materialsMap}
                    costPerMinute={costPerMinute}
                />
            )}
            {isComboModalOpen && (
                <ComboModal comboToEdit={editingCombo} allServices={services} allServiceRecipes={serviceRecipes} allMaterials={materials} onClose={() => setIsComboModalOpen(false)} onSave={handleSaveCombo} costPerMinute={costPerMinute} />
            )}
            <ConfirmationModal
                isOpen={!!deletingService || !!deletingCombo}
                onClose={() => { setDeletingService(null); setDeletingCombo(null); }}
                onConfirm={deletingService ? confirmDeleteService : confirmDeleteCombo}
                title="Confirmar Exclusão"
                message={
                    deletingService ? `Tem certeza de que deseja apagar o serviço "${deletingService.name}"? Sua receita de custo também será apagada.`
                    : (deletingCombo ? `Tem certeza de que deseja apagar o pacote "${deletingCombo?.name}"?` : '')
                }
            />
            
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={effectiveOnBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">{title}</h3>
            </header>

            <div className="flex-grow overflow-y-auto pr-2 pb-24">
                {view === 'recipe_form' && editingRecipe ? (
                    <ServiceCostCalculator 
                        recipe={editingRecipe as ServiceRecipe} 
                        allRecipes={serviceRecipes}
                        materials={materials} 
                        services={services}
                        onSave={handleSaveRecipeAndService}
                        onCancel={() => setView('list')}
                        costPerMinute={costPerMinute}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col space-y-8">
                        {/* Services Section */}
                        <div>
                            <header className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-700">Serviços</h3>
                                <button onClick={handleAddNewService} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"><PlusIcon /> Novo Serviço</button>
                            </header>
                            {services.length > 0 ? (
                                <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                                    <ul className="divide-y divide-gray-200">
                                        {services.map(service => {
                                            const recipe = serviceRecipes.find(r => r.serviceId === service.id);
                                            let baseCalculatedPrice = 0;
                                            if (recipe && !service.useManualPrice) {
                                                const { totalCost } = calculateServiceCostBreakdown(recipe, materialsMap, costPerMinute);
                                                const profitMargin = Math.max(0, Math.min(0.99, recipe.profitMarginPercent / 100));
                                                baseCalculatedPrice = profitMargin < 1 ? totalCost / (1 - profitMargin) : totalCost;
                                            }
                                            const isAutoRounded = !service.useManualPrice && service.useRounding && baseCalculatedPrice > 0;

                                            return (
                                                <li key={service.id} className="p-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{service.name}</p>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <span className="font-semibold text-gray-700">R$ {service.price.toFixed(2)}</span>
                                                            {isAutoRounded && <span className="text-xs text-gray-500">(Base: R$ {baseCalculatedPrice.toFixed(2)})</span>}
                                                            <span className="text-gray-400">-</span>
                                                            <span>{service.duration} min</span>
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            {service.useManualPrice ? (
                                                                <span title="Preço manual" className="flex items-center text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"><HandThumbUpIcon className="w-3 h-3 mr-1"/> Manual</span>
                                                            ) : (
                                                                <span title="Preço calculado via receita" className="flex items-center text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full"><CalculatorIcon className="w-3 h-3 mr-1"/> Automático</span>
                                                            )}
                                                            {recipe ? <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Receita OK</span>
                                                                   : <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Sem Receita</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleEditService(service)} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Editar Serviço</button>
                                                        <button onClick={() => handleManageRecipe(service)} disabled={!service.id} className={`px-3 py-1.5 text-sm font-semibold text-white rounded-md ${recipe ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}>
                                                            {recipe ? 'Editar Receita' : 'Criar Receita'}
                                                        </button>
                                                        <button onClick={() => handleDeleteService(service)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                                    <p>Nenhum serviço cadastrado.</p>
                                    <p className="text-sm">Clique em "Novo Serviço" para começar.</p>
                                </div>
                            )}
                        </div>

                        {/* Combos & Packages Section */}
                        <div>
                            <header className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-700">Combos & Pacotes</h3>
                                <button onClick={handleAddNewCombo} className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"><PlusIcon /> Criar Novo Pacote</button>
                            </header>
                            {combos.length > 0 ? (
                                <div className="space-y-3">
                                    {combos.map(combo => {
                                        const includedServices = combo.serviceIds.map(id => services.find(s => s.id === id)).filter(Boolean) as Service[];
                                        const sumOfIndividualPrices = includedServices.reduce((sum, s) => sum + s.price, 0);
                                        const basePriceFromDiscount = sumOfIndividualPrices > 0 ? sumOfIndividualPrices * (1 - (combo.discount || 0) / 100) : 0;
                                        const totalDuration = includedServices.reduce((sum, s) => sum + s.duration, 0);
                                        const isRounded = combo.useRounding && Math.abs(combo.finalPrice - basePriceFromDiscount) > 0.01;

                                        return (
                                            <div key={combo.id} className="bg-white/80 border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <ArchiveBoxIcon className="w-8 h-8 text-pink-500 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{combo.name}</p>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <span className="font-semibold text-gray-700">R$ {combo.finalPrice.toFixed(2)}</span>
                                                            {isRounded && <span className="text-xs text-gray-500">(Base: R$ {basePriceFromDiscount.toFixed(2)})</span>}
                                                            <span className="text-gray-400">-</span>
                                                            <span>{totalDuration} min - {combo.serviceIds.length} serviços</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleDuplicateCombo(combo)} className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">Duplicar</button>
                                                    <button onClick={() => handleEditCombo(combo)} className="px-4 py-1.5 text-sm font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">Editar</button>
                                                    <button onClick={() => handleDeleteCombo(combo)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                                    <p>Nenhum pacote criado.</p>
                                    <p className="text-sm">Clique em "Criar Novo Pacote" para começar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ServiceModalProps {
    service: Partial<Service> | null;
    onClose: () => void;
    onSave: (serviceData: Partial<Service>) => void;
    serviceRecipes: ServiceRecipe[];
    materialsMap: Map<string, Material>;
    costPerMinute: number;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, onSave, serviceRecipes, materialsMap, costPerMinute }) => {
    const calculatedPrice = useMemo(() => {
        if (!service?.id) return 0;
        const recipe = serviceRecipes.find(r => r.serviceId === service.id);
        if (!recipe) return 0;

        const { totalCost } = calculateServiceCostBreakdown(recipe, materialsMap, costPerMinute);
        const profitMargin = Math.max(0, Math.min(0.99, recipe.profitMarginPercent / 100));
        return profitMargin < 1 ? totalCost / (1 - profitMargin) : totalCost;
    }, [service, serviceRecipes, materialsMap, costPerMinute]);
    
    const [draft, setDraft] = useState<Partial<Service>>(() => {
        const initial = service || { name: '', duration: 30, useManualPrice: false, useRounding: true };
        if (initial.useManualPrice === false) {
            const basePrice = calculatedPrice;
            initial.price = initial.useRounding ? applyCustomRounding(basePrice) : basePrice;
        }
        return initial;
    });

    const handleToggleManualPrice = (enabled: boolean) => {
        setDraft(prev => {
            const newDraft = { ...prev, useManualPrice: enabled };
            if (!enabled) { // switching back to auto
                const basePrice = calculatedPrice;
                newDraft.price = newDraft.useRounding ? applyCustomRounding(basePrice) : basePrice;
            }
            return newDraft;
        });
    };
    
    const handleToggleRounding = (enabled: boolean) => {
        setDraft(prev => {
            const newDraft = { ...prev, useRounding: enabled };
            if (!newDraft.useManualPrice) {
                const basePrice = calculatedPrice;
                newDraft.price = enabled ? applyCustomRounding(basePrice) : basePrice;
            }
            return newDraft;
        });
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['price', 'duration'].includes(name);
        setDraft(prev => ({...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
    };

    const handleSave = () => {
        if (!draft.name?.trim()) {
            alert("O nome do serviço é obrigatório.");
            return;
        }
        onSave(draft);
    };

    return (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{draft.id ? 'Editar' : 'Novo'} Serviço</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Serviço</label>
                        <input type="text" name="name" value={draft.name || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Preço (R$)</label>
                            <input 
                                type="number" 
                                name="price" 
                                value={draft.price?.toFixed(2) || '0.00'}
                                onChange={handleChange} 
                                disabled={!draft.useManualPrice}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${!draft.useManualPrice ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Duração (min)</label>
                            <input type="number" name="duration" value={draft.duration || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                        </div>
                    </div>
                     <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                        <div>
                            <label className="font-medium text-gray-700">Usar Preço Manual</label>
                            <p className="text-xs text-gray-500">Desative para usar o preço calculado pela receita.</p>
                        </div>
                        <ToggleSwitch enabled={draft.useManualPrice || false} onChange={handleToggleManualPrice} />
                    </div>
                    <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                        <div>
                            <label className="font-medium text-gray-700">Arredondar Preço</label>
                            <p className="text-xs text-gray-500">Arredonda o preço final para um valor comercial.</p>
                        </div>
                        <ToggleSwitch enabled={draft.useRounding || false} onChange={handleToggleRounding} />
                    </div>
                </div>
                <footer className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600">Salvar</button>
                </footer>
            </div>
        </div>
    );
};

export default ServicesAndPackagesPanel;
