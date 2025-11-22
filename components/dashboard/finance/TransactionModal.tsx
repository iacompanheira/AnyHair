// components/dashboard/finance/TransactionModal.tsx
import React, { useState } from 'react';
import type { Transaction } from '../../../types';
import { CloseIcon } from '../Icons';

interface TransactionModalProps {
    transaction: Partial<Transaction> | null;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
}

const expenseCategories = ['Pessoal', 'Aluguel', 'Contas', 'Produtos', 'Marketing', 'Administrativo', 'Impostos', 'Outros'];

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose, onSave }) => {
    const [draft, setDraft] = useState<Partial<Transaction>>(transaction || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDraft(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!draft.description || !draft.amount || !draft.date) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }
        onSave(draft as Transaction);
    };

    const toInputDate = (isoDate?: string) => isoDate ? isoDate.split('T')[0] : '';
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{draft.id ? 'Editar' : 'Nova'} Transação</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4">
                    <div className="flex border-b">
                         <button onClick={() => setDraft(p => ({...p, type: 'expense'}))} className={`flex-1 p-2 font-semibold ${draft.type === 'expense' ? 'text-red-600 border-b-2 border-red-500' : 'text-gray-500'}`}>Despesa</button>
                        <button onClick={() => setDraft(p => ({...p, type: 'income'}))} className={`flex-1 p-2 font-semibold ${draft.type === 'income' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500'}`}>Receita</button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
                        <input type="text" name="description" value={draft.description || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Valor (R$)</label>
                            <input type="number" name="amount" value={draft.amount || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Data</label>
                            <input type="date" name="date" value={toInputDate(draft.date)} onChange={e => setDraft(p => ({...p, date: new Date(e.target.value).toISOString()}))} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                     {draft.type === 'expense' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Categoria</label>
                            <select name="category" value={draft.category || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                                <option value="">Selecione uma categoria</option>
                                {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                     )}
                </div>
                <footer className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600">Salvar</button>
                </footer>
            </div>
        </div>
    );
};

export default TransactionModal;
