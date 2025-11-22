import React, { useState, useMemo } from 'react';
import type { Service, ServiceRecipe, Combo, Material } from '../../../types';
import { PlusIcon, EditIcon, TrashIcon, ArchiveBoxIcon } from '../Icons';
import ConfirmationModal from './ConfirmationModal';
import ComboModal from './ComboModal';
import { generateUUID } from '../../../utils/date';

interface CombosAndPackagesPanelProps {
    services: Service[];
    serviceRecipes: ServiceRecipe[];
    materials: Material[];
    combos: Combo[];
    onCombosChange: (combos: Combo[]) => void;
    costPerMinute: number;
}

const CombosAndPackagesPanel: React.FC<CombosAndPackagesPanelProps> = ({ services, serviceRecipes, materials, combos, onCombosChange, costPerMinute }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState<Partial<Combo> | null>(null);
    const [deletingCombo, setDeletingCombo] = useState<Combo | null>(null);
    
    const servicesMap = useMemo(() => new Map(services.map(s => [s.id, s])), [services]);

    const handleAddNew = () => {
        setEditingCombo({});
        setIsModalOpen(true);
    };

    const handleEdit = (combo: Combo) => {
        setEditingCombo(combo);
        setIsModalOpen(true);
    };

    const handleDuplicate = (combo: Combo) => {
        const { id, ...duplicatedCombo } = combo;
        setEditingCombo({
            ...duplicatedCombo,
            name: `${combo.name} (Cópia)`,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (combo: Combo) => {
        setDeletingCombo(combo);
    };
    
    const confirmDelete = () => {
        if (deletingCombo) {
            onCombosChange(combos.filter(c => c.id !== deletingCombo.id));
            setDeletingCombo(null);
        }
    };
    
    const handleSave = (comboToSave: Combo) => {
        let updatedCombos;
        if (comboToSave.id) {
            updatedCombos = combos.map(c => c.id === comboToSave.id ? comboToSave : c);
        } else {
            updatedCombos = [...combos, { ...comboToSave, id: generateUUID() }];
        }
        onCombosChange(updatedCombos);
        setIsModalOpen(false);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {isModalOpen && (
                <ComboModal
                    comboToEdit={editingCombo}
                    allServices={services}
                    allServiceRecipes={serviceRecipes}
                    allMaterials={materials}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    costPerMinute={costPerMinute}
                />
            )}
            <ConfirmationModal
                isOpen={!!deletingCombo}
                onClose={() => setDeletingCombo(null)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza de que deseja apagar o pacote "${deletingCombo?.name}"?`}
            />

            <header className="flex-shrink-0 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">Gerenciamento de Pacotes e Combos</h3>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2">
                        <PlusIcon /> Criar Novo Pacote
                    </button>
                </div>
            </header>

            <div className="flex-grow overflow-y-auto">
                {combos.length > 0 ? (
                    <div className="space-y-3">
                        {combos.map(combo => {
                            const totalDuration = combo.serviceIds.reduce((sum, id) => sum + (servicesMap.get(id)?.duration || 0), 0);
                            return (
                                <div key={combo.id} className="bg-white/80 border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <ArchiveBoxIcon className="w-8 h-8 text-pink-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{combo.name}</p>
                                            <p className="text-sm text-gray-500">
                                                R$ {combo.finalPrice.toFixed(2)} - {totalDuration} min - {combo.serviceIds.length} serviços
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDuplicate(combo)} className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">Duplicar</button>
                                        <button onClick={() => handleEdit(combo)} className="px-4 py-1.5 text-sm font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">Editar</button>
                                        <button onClick={() => handleDelete(combo)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                        <p>Nenhum pacote criado.</p>
                        <p className="text-sm">Clique em "Criar Novo Pacote" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CombosAndPackagesPanel;
