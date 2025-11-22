// components/dashboard/finance/TransactionsList.tsx
import React, { useState, useMemo } from 'react';
import type { Transaction } from '../../../types';
import { TrendUpIcon, TrendDownIcon, EditIcon, TrashIcon } from '../Icons';

type SortConfig = {
    key: 'date' | 'amount';
    direction: 'ascending' | 'descending';
} | null;

interface TransactionsListProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (transactionId: string) => void;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions, onEdit, onDelete }) => {
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });

    const filteredAndSortedTransactions = useMemo(() => {
        let sortableItems = [...transactions];
        if (filter !== 'all') {
            sortableItems = sortableItems.filter(t => t.type === filter);
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [transactions, filter, sortConfig]);
    
    const requestSort = (key: 'date' | 'amount') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: 'date' | 'amount') => {
        if (!sortConfig || sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    return (
        <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Transações Recentes</h3>
                 <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg">
                    {(['all', 'income', 'expense'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === f ? 'bg-white shadow-sm text-pink-600' : 'text-gray-600 hover:bg-white/50'}`}>
                           {f === 'all' ? 'Todos' : f === 'income' ? 'Entradas' : 'Saídas'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                        <tr>
                            <th scope="col" className="px-6 py-3" onClick={() => requestSort('date')}>Data {getSortIndicator('date')}</th>
                            <th scope="col" className="px-6 py-3">Descrição</th>
                            <th scope="col" className="px-6 py-3" onClick={() => requestSort('amount')}>Valor {getSortIndicator('amount')}</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedTransactions.map(t => (
                            <tr key={t.id} className="bg-white border-b hover:bg-gray-50/50">
                                <td className="px-6 py-3">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC'})}</td>
                                <td className="px-6 py-3 font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        {t.type === 'income' ? <TrendUpIcon className="w-4 h-4 text-green-500"/> : <TrendDownIcon className="w-4 h-4 text-red-500"/>}
                                        {t.description}
                                    </div>
                                    <p className="text-xs text-gray-400">{t.category}</p>
                                </td>
                                <td className={`px-6 py-3 font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="px-6 py-3">
                                    <button onClick={() => onEdit(t)} disabled={!t.canBeDeleted} className="p-1.5 text-gray-500 hover:text-blue-600 disabled:text-gray-300"><EditIcon /></button>
                                    <button onClick={() => onDelete(t.id)} disabled={!t.canBeDeleted} className="p-1.5 text-gray-500 hover:text-red-600 disabled:text-gray-300"><TrashIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAndSortedTransactions.length === 0 && (
                    <p className="text-center py-8 text-gray-500">Nenhuma transação encontrada.</p>
                )}
            </div>
        </div>
    );
};

export default TransactionsList;
