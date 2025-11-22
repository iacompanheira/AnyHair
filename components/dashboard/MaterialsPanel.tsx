import React, { useState, useMemo, useEffect } from 'react';
import type { Material } from '../../types';
import SaveBar from './SaveBar';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon, AlertTriangleIcon, ArrowLeftIcon } from './Icons';
import { generateUUID } from '../../utils/date';

// --- PROPS & TYPES ---
interface MaterialsPanelProps {
    materials: Material[];
    onMaterialsChange: (materials: Material[]) => void;
    onBack: () => void;
}
type FilterStatus = 'all' | 'low' | 'minimum';
const unitLabels: Record<Material['unit'], string> = {
    un: 'Unidades', kg: 'Kg', g: 'g', mg: 'mg', l: 'L', ml: 'mL'
};

// --- MAIN COMPONENT ---
const MaterialsPanel: React.FC<MaterialsPanelProps> = ({ materials: initialMaterials, onMaterialsChange, onBack }) => {
    const [draftMaterials, setDraftMaterials] = useState(initialMaterials);
    const [hasChanges, setHasChanges] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Partial<Material> | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

    useEffect(() => {
        setHasChanges(JSON.stringify(draftMaterials) !== JSON.stringify(initialMaterials));
    }, [draftMaterials, initialMaterials]);

    const filteredMaterials = useMemo(() => {
        return draftMaterials
            .filter(mat => mat.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(mat => {
                if (filterStatus === 'low') return mat.currentStock < mat.minStock;
                if (filterStatus === 'minimum') return mat.currentStock === mat.minStock;
                return true;
            });
    }, [draftMaterials, searchTerm, filterStatus]);

    const handleSave = () => onMaterialsChange(draftMaterials);
    const handleCancel = () => setDraftMaterials(initialMaterials);
    
    const handleAddNew = () => {
        setEditingMaterial({ name: '', packagePrice: 0, packageSize: 1, unit: 'un', currentStock: 0, minStock: 1, yield: 1 });
        setIsModalOpen(true);
    };

    const handleEdit = (material: Material) => {
        setEditingMaterial(material);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = (material: Material) => {
        setDeletingMaterial(material);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingMaterial) {
            setDraftMaterials(prev => prev.filter(m => m.id !== deletingMaterial.id));
        }
        setIsConfirmOpen(false);
        setDeletingMaterial(null);
    };

    const handleSaveMaterial = (materialData: Partial<Material>) => {
        if (materialData.id) { // Editing
            setDraftMaterials(prev => prev.map(m => m.id === materialData.id ? materialData as Material : m));
        } else { // Adding
            setDraftMaterials(prev => [...prev, { ...materialData, id: generateUUID() } as Material]);
        }
        setIsModalOpen(false);
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


    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800">
            {/* --- MODALS --- */}
            {isModalOpen && editingMaterial && (
                <MaterialFormModal
                    material={editingMaterial}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveMaterial}
                />
            )}
            {isConfirmOpen && deletingMaterial && (
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsConfirmOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <h3 className="text-lg font-semibold">Confirmar Exclusão</h3>
                            <p className="text-gray-600 mt-2">Deseja excluir o material <strong>{deletingMaterial.name}</strong>? Esta ação não pode ser desfeita.</p>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                            <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancelar</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">Excluir</button>
                        </div>
                    </div>
                </div>
            )}
            
             <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={handleBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Estoque de Materiais</h3>
                <div className="flex-grow"></div>
                <button onClick={handleAddNew} className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"><PlusIcon /> Novo Material</button>
            </header>

            {/* --- FILTERS --- */}
            <div className="flex-shrink-0 mb-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Buscar material por nome..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                     <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                        {(['all', 'low', 'minimum'] as FilterStatus[]).map(f => (
                            <button key={f} onClick={() => setFilterStatus(f)} className={`w-full px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filterStatus === f ? 'bg-white shadow-sm text-pink-600' : 'text-gray-600 hover:bg-white/50'}`}>
                               {f === 'all' ? 'Todos' : f === 'low' ? 'Estoque Baixo' : 'Estoque Mínimo'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MATERIALS LIST --- */}
            <div className="flex-grow overflow-y-auto pr-2 pb-24">
                {filteredMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredMaterials.map(mat => <MaterialCard key={mat.id} material={mat} onEdit={handleEdit} onDelete={handleDeleteClick} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <p>Nenhum material encontrado.</p>
                        <p className="text-sm">Tente ajustar seus filtros ou adicione um novo material.</p>
                    </div>
                )}
            </div>
            <SaveBar hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

// --- MATERIAL CARD ---
const MaterialCard: React.FC<{ material: Material, onEdit: (m: Material) => void, onDelete: (m: Material) => void }> = ({ material, onEdit, onDelete }) => {
    const costPerUnit = material.packagePrice / material.packageSize;
    const stockStatus = material.currentStock < material.minStock ? 'low' : material.currentStock === material.minStock ? 'minimum' : 'normal';
    
    const statusStyles = {
        low: 'bg-red-50 border-l-4 border-red-400',
        minimum: 'bg-yellow-50 border-l-4 border-yellow-400',
        normal: 'bg-gray-50/50 border-l-4 border-gray-300',
    };
    const progress = Math.min((material.currentStock / (material.minStock * 2)) * 100, 100);

    return (
        <div className={`rounded-lg shadow-sm transition-shadow hover:shadow-md ${statusStyles[stockStatus]}`}>
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                         {stockStatus !== 'normal' && <AlertTriangleIcon className={`w-5 h-5 ${stockStatus === 'low' ? 'text-red-500' : 'text-yellow-500'}`} />}
                        <h4 className="font-bold text-gray-800">{material.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(material)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" aria-label={`Editar ${material.name}`}><EditIcon /></button>
                        <button onClick={() => onDelete(material)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full" aria-label={`Excluir ${material.name}`}><TrashIcon /></button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                    <div><p className="text-gray-500">Preço Embalagem</p><p className="font-semibold">R$ {material.packagePrice.toFixed(2)}</p></div>
                    <div><p className="text-gray-500">Conteúdo</p><p className="font-semibold">{material.packageSize} {material.unit}</p></div>
                    <div><p className="text-gray-500">Custo p/ Unidade</p><p className="font-semibold">R$ {costPerUnit.toFixed(2)}</p></div>
                    <div><p className="text-gray-500">Estoque Atual</p><p className="font-semibold">{material.currentStock}</p></div>
                    <div><p className="text-gray-500">Estoque Mínimo</p><p className="font-semibold">{material.minStock}</p></div>
                    <div><p className="text-gray-500">Rendimento</p><p className="font-semibold">{material.yield || 'N/A'} serviços</p></div>
                </div>
                 <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${stockStatus === 'low' ? 'bg-red-500' : stockStatus === 'minimum' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MATERIAL FORM MODAL ---
const MaterialFormModal: React.FC<{ material: Partial<Material>, onClose: () => void, onSave: (m: Partial<Material>) => void }> = ({ material, onClose, onSave }) => {
    const [draft, setDraft] = useState(material);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!draft.name?.trim()) newErrors.name = "Nome é obrigatório.";
        if (draft.packagePrice! < 0) newErrors.packagePrice = "Valor inválido.";
        if (draft.packageSize! <= 0) newErrors.packageSize = "Valor inválido.";
        if (draft.currentStock! < 0) newErrors.currentStock = "Valor inválido.";
        if (draft.minStock! < 0) newErrors.minStock = "Valor inválido.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['packagePrice', 'packageSize', 'currentStock', 'minStock', 'yield'].includes(name);
        setDraft(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
    };

    const handleSave = () => {
        if (validate()) {
            onSave(draft);
        }
    };
    
    return (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{draft.id ? 'Editar' : 'Novo'} Material</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Material</label>
                        <input type="text" name="name" value={draft.name || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Preço (R$)</label>
                            <input type="number" name="packagePrice" value={draft.packagePrice || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                             {errors.packagePrice && <p className="text-xs text-red-600 mt-1">{errors.packagePrice}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Conteúdo</label>
                            <input type="number" name="packageSize" value={draft.packageSize || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                            {errors.packageSize && <p className="text-xs text-red-600 mt-1">{errors.packageSize}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Unidade</label>
                            <select name="unit" value={draft.unit} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                                {Object.entries(unitLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Estoque Atual</label>
                            <input type="number" name="currentStock" value={draft.currentStock || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                            {errors.currentStock && <p className="text-xs text-red-600 mt-1">{errors.currentStock}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Estoque Mínimo</label>
                            <input type="number" name="minStock" value={draft.minStock || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                             {errors.minStock && <p className="text-xs text-red-600 mt-1">{errors.minStock}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Rendimento (serviços)</label>
                            <input type="number" name="yield" value={draft.yield || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                        </div>
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


export default MaterialsPanel;
