// components/dashboard/FinanceManager.tsx
import React, { useState, useMemo } from 'react';
import type { Service, Material, ServiceRecipe, Combo, CostSettings, Employee, Appointment, Transaction } from '../../types';
import CostConfigurationPanel from './pricing/CostConfigurationPanel';
import FinancialOverviewPanel from './finance/FinancialOverviewPanel';
import { 
    ArrowLeftIcon
} from '../Icons';

// --- MAIN FINANCE MANAGER ---

interface FinanceManagerProps {
    employees: Employee[];
    appointments: Appointment[];
    transactions: Transaction[];
    onTransactionsChange: (transactions: Transaction[]) => void;
    costSettings: CostSettings;
    onCostSettingsChange: (settings: CostSettings) => void;
    onBack: () => void;
}

type FinanceTab = 'overview' | 'costs';

const FinanceManager: React.FC<FinanceManagerProps> = (props) => {
    const { 
        employees, costSettings, onCostSettingsChange, onBack,
        appointments, transactions, onTransactionsChange
    } = props;
    const [activeTab, setActiveTab] = useState<FinanceTab>('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <FinancialOverviewPanel 
                                        allAppointments={appointments}
                                        allTransactions={transactions}
                                        onTransactionsChange={onTransactionsChange}
                                        costSettings={costSettings}
                                    />;
            case 'costs': return <CostConfigurationPanel
                                        costSettings={costSettings}
                                        onCostSettingsChange={onCostSettingsChange}
                                        employees={employees}
                                    />;
            default: return null;
        }
    };

    const tabs: { id: FinanceTab, label: string }[] = [
        { id: 'overview', label: 'Visão Geral' },
        { id: 'costs', label: 'Configuração de Custos' },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col h-full text-gray-800">
            <header className="flex items-center mb-4 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Finanças e Custos</h3>
            </header>
            
            <div className="flex-shrink-0 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)} 
                            className={`py-3 px-2 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow mt-6 overflow-y-auto pr-2 pb-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default FinanceManager;