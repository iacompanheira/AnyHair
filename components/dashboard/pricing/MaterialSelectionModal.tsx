import React, { useState, useMemo } from 'react';
import type { Material } from '../../../types';
import { CloseIcon } from '../Icons';

interface MaterialSelectionModalProps {
  allMaterials: Material[];
  initialSelected: { materialId: string; quantity: number }[];
  onClose: () => void;
  onSave: (selected: { materialId: string; quantity: number }[]) => void;
}

const unitLabels: Record<Material['unit'], string> = {
    un: 'Unid.', kg: 'kg', g: 'g', mg: 'mg', l: 'L', ml: 'mL'
};

const MaterialSelectionModal: React.FC<MaterialSelectionModalProps> = ({ allMaterials, initialSelected, onClose, onSave }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    initialSelected.reduce((acc, item) => {
      acc[item.materialId] = item.quantity;
      return acc;
    }, {} as Record<string, number>)
  );
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMaterials = useMemo(() =>
    allMaterials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
  , [allMaterials, searchTerm]);

  const handleQuantityChange = (materialId: string, value: string) => {
    const numValue = parseFloat(value);
    setQuantities(prev => ({
      ...prev,
      [materialId]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSave = () => {
    const selected = Object.entries(quantities)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([materialId, quantity]) => ({ materialId, quantity: Number(quantity) }));
    onSave(selected);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog" aria-modal="true"
    >
      <div
        className="bg-white text-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-800">Adicionar Materiais e Quantidades</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
        </header>

        <div className="p-4 border-b border-gray-200 sticky top-[65px] bg-white">
             <input
                type="text"
                placeholder="Buscar material..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-gray-800"
            />
        </div>

        <div className="flex-grow overflow-y-auto">
            <ul className="divide-y divide-gray-200">
                {filteredMaterials.map(material => {
                    const costPerUnit = material.packagePrice / material.packageSize;
                    return (
                        <li key={material.id} className="p-4 grid grid-cols-3 items-center gap-4">
                            <div>
                                <p className="font-semibold text-gray-800">{material.name}</p>
                                <p className="text-xs text-gray-500">
                                    {material.packageSize} {unitLabels[material.unit]} por R$ {material.packagePrice.toFixed(2)}
                                    <span className="text-pink-500"> (R$ {costPerUnit.toFixed(3)}/{unitLabels[material.unit]})</span>
                                </p>
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={quantities[material.id] || ''}
                                        onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                                        placeholder="0"
                                        className="w-24 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-right focus:ring-pink-500 focus:border-pink-500"
                                    />
                                    <span className="w-12 text-gray-500">{unitLabels[material.unit]}</span>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
        
        <footer className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0">
          <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">
            Salvar Materiais
          </button>
        </footer>
      </div>
    </div>
  );
};

export default MaterialSelectionModal;