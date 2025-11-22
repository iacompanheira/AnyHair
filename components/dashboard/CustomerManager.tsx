

import React, { useState, useEffect, useMemo } from 'react';
import type { Customer } from '../../types';
import SaveBar from './SaveBar';
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon } from './Icons';
import { generateUUID } from '../../utils/date';


interface CustomerManagerProps {
    customers: Customer[];
    onCustomersChange: (customers: Customer[]) => void;
    onBack: () => void;
}

const ITEMS_PER_PAGE = 50;

const CustomerManager: React.FC<CustomerManagerProps> = ({ customers: initialCustomers, onCustomersChange, onBack }) => {
    const [localCustomers, setLocalCustomers] = useState(initialCustomers);
    const [hasChanges, setHasChanges] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setHasChanges(JSON.stringify(localCustomers) !== JSON.stringify(initialCustomers));
    }, [localCustomers, initialCustomers]);
    
    const filteredCustomers = useMemo(() => {
        return localCustomers.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
        );
    }, [localCustomers, searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCustomers, currentPage]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

    const handleModalSave = () => {
         if (!currentCustomer.name || !currentCustomer.phone) {
            alert("Nome e telefone são obrigatórios.");
            return;
        }
        if (currentCustomer.id) { // Editing
            setLocalCustomers(localCustomers.map(c => c.id === currentCustomer.id ? { ...c, ...currentCustomer } as Customer : c));
        } else { // Adding
            setLocalCustomers([{ ...currentCustomer, id: generateUUID() } as Customer, ...localCustomers]);
        }
        setModalOpen(false);
    };
    
    const handleEdit = (customer: Customer) => {
        setCurrentCustomer(customer);
        setModalOpen(true);
    };
    
    const handleAdd = () => {
        setCurrentCustomer({ name: '', phone: '', notes: '', cpf: '' });
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja remover este cliente?")) {
            setLocalCustomers(localCustomers.filter(c => c.id !== id));
        }
    };

    const handleSaveChanges = () => {
        onCustomersChange(localCustomers);
    };

    const handleCancelChanges = () => {
        setLocalCustomers(initialCustomers);
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
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={handleBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Gerenciar Clientes</h3>
                <div className="flex-grow"></div>
                <button onClick={handleAdd} className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors flex items-center"><PlusIcon/> Adicionar Cliente</button>
            </header>
            <div className="mb-4">
                 <input
                    type="text"
                    placeholder="Buscar por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                />
            </div>
            <div className="flex-grow overflow-y-auto pr-2 pb-24">
                <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                    <ul className="divide-y divide-gray-200">
                        {paginatedCustomers.map(customer => (
                             <li key={customer.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{customer.name}</p>
                                    <p className="text-sm text-gray-500">{customer.phone}</p>
                                    {customer.cpf && <p className="text-sm text-gray-500">CPF: {customer.cpf}</p>}
                                    {customer.notes && <p className="text-xs text-gray-400 mt-1 italic">"{customer.notes}"</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleEdit(customer)} className="p-2 text-blue-600 hover:text-blue-800"><EditIcon/></button>
                                    <button onClick={() => handleDelete(customer.id)} className="p-2 text-red-600 hover:text-red-800"><TrashIcon/></button>
                                </div>
                            </li>
                        ))}
                        {paginatedCustomers.length === 0 && <li className="p-8 text-center text-gray-500">Nenhum cliente encontrado.</li>}
                    </ul>
                </div>
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center items-center gap-4">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-md disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-600">
                            Página {currentPage} de {totalPages} ({filteredCustomers.length} resultados)
                        </span>
                         <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-md disabled:opacity-50"
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
            <SaveBar hasChanges={hasChanges} onSave={handleSaveChanges} onCancel={handleCancelChanges} />
             {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setModalOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                         <header className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">{currentCustomer.id ? 'Editar' : 'Adicionar'} Cliente</h3>
                        </header>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
                                <input type="text" value={currentCustomer.name || ''} onChange={e => setCurrentCustomer(c => ({...c, name: e.target.value}))} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label>
                                <input type="tel" value={currentCustomer.phone || ''} onChange={e => setCurrentCustomer(c => ({...c, phone: e.target.value}))} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">CPF (Opcional)</label>
                                <input type="text" value={currentCustomer.cpf || ''} onChange={e => setCurrentCustomer(c => ({...c, cpf: e.target.value}))} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Observações</label>
                                <textarea value={currentCustomer.notes || ''} onChange={e => setCurrentCustomer(c => ({...c, notes: e.target.value}))} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"/>
                            </div>
                        </div>
                        <footer className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end gap-3">
                            <button onClick={() => setModalOpen(false)} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                            <button onClick={handleModalSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">Salvar</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManager;
