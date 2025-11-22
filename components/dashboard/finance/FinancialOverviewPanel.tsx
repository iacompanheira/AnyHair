// components/dashboard/finance/FinancialOverviewPanel.tsx
import React, { useState } from 'react';
import type { Appointment, Transaction, CostSettings } from '../../../types';
import { useFinancialData, Period } from './hooks/useFinancialData';
import ReportToolbar from './ReportToolbar';
import KpiCard from './KpiCard';
import CashFlowChart from './CashFlowChart';
import ExpensesChart from './ExpensesChart';
import TransactionsList from './TransactionsList';
import TransactionModal from './TransactionModal';
import { DollarIcon, TrendUpIcon, TrendDownIcon, PieChartIcon } from '../Icons';
import { generateUUID } from '../../../utils/date';

interface FinancialOverviewPanelProps {
    allAppointments: Appointment[];
    allTransactions: Transaction[];
    onTransactionsChange: (transactions: Transaction[]) => void;
    costSettings: CostSettings;
}

const FinancialOverviewPanel: React.FC<FinancialOverviewPanelProps> = ({ allAppointments, allTransactions, onTransactionsChange, costSettings }) => {
    const [period, setPeriod] = useState<Period>(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29);
        return { startDate, endDate, label: 'Últimos 30 dias' };
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Partial<Transaction> | null>(null);
    const [expensesView, setExpensesView] = useState<'pie' | 'bar'>('pie');
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);


    const financialData = useFinancialData(period.startDate, period.endDate, allAppointments, allTransactions, costSettings);

    const handleAddTransaction = (type: 'income' | 'expense') => {
        setEditingTransaction({ type, date: new Date().toISOString() });
        setIsModalOpen(true);
    };
    
    const handleEditTransaction = (transaction: Transaction) => {
        if(transaction.canBeDeleted) {
            setEditingTransaction(transaction);
            setIsModalOpen(true);
        } else {
            alert("Transações de agendamentos não podem ser editadas aqui.");
        }
    };

    const handleSaveTransaction = (transaction: Transaction) => {
        let updated;
        if (transaction.id) { // Editing
             updated = allTransactions.map(t => t.id === transaction.id ? transaction : t);
        } else { // Adding
            updated = [...allTransactions, { ...transaction, id: generateUUID() }];
        }
        onTransactionsChange(updated);
        setIsModalOpen(false);
    };
    
    const handleDeleteTransaction = (transactionId: string) => {
        if(window.confirm("Tem certeza que deseja apagar esta transação?")) {
            onTransactionsChange(allTransactions.filter(t => t.id !== transactionId));
        }
    };

    return (
        <div className="w-full h-full space-y-6">
            {isModalOpen && (
                <TransactionModal
                    transaction={editingTransaction}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTransaction}
                />
            )}
            <ReportToolbar
                period={period}
                onPeriodChange={setPeriod}
                onAddIncome={() => handleAddTransaction('income')}
                onAddExpense={() => handleAddTransaction('expense')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Faturamento Total" value={financialData.kpis.faturamento} previousValue={financialData.previousKpis.faturamento} format="currency" />
                <KpiCard title="Despesas Totais" value={financialData.kpis.despesas} previousValue={financialData.previousKpis.despesas} format="currency" />
                <KpiCard title="Lucro Líquido" value={financialData.kpis.lucro} previousValue={financialData.previousKpis.lucro} format="currency" />
                <KpiCard 
                    title="Ponto de Equilíbrio (Mês)"
                    value={financialData.kpis.faturamento}
                    goal={financialData.kpis.pontoDeEquilibrio}
                    format="break-even"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 border border-gray-200 rounded-xl p-4">
                     <h3 className="text-lg font-semibold text-gray-700 mb-2">Fluxo de Caixa</h3>
                     <CashFlowChart data={financialData.cashFlowData} />
                </div>
                <div className="bg-white/80 border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-700">Despesas por Categoria</h3>
                         <div className="flex items-center gap-1 bg-gray-200 p-0.5 rounded-md">
                            <button onClick={() => setExpensesView('pie')} className={`px-2 py-0.5 text-xs rounded ${expensesView === 'pie' ? 'bg-white shadow-sm' : ''}`}><PieChartIcon className="w-4 h-4" /></button>
                            <button onClick={() => setExpensesView('bar')} className={`px-2 py-0.5 text-xs rounded ${expensesView === 'bar' ? 'bg-white shadow-sm' : ''}`}>Barras</button>
                        </div>
                    </div>
                    <ExpensesChart data={financialData.expenseCategoryData} view={expensesView} />
                </div>
            </div>

            <TransactionsList 
                transactions={financialData.allPeriodEvents} 
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
            />
        </div>
    );
};

export default FinancialOverviewPanel;
