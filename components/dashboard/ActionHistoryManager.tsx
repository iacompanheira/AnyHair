// components/dashboard/ActionHistoryManager.tsx
import React, { useState, useMemo } from 'react';
import type { AuditLog } from '../../types';
import { 
    ArrowLeftIcon, UsersIcon, ClipboardListIcon, ImageIcon, SparklesIcon, ClockIcon, CalendarIcon,
    PrintIcon, FilePdfIcon, FileCsvIcon, DollarIcon, StarIcon
} from './Icons';

interface ActionHistoryManagerProps {
    logs: AuditLog[];
    onBack: () => void;
}

const entityIcons: { [key in AuditLog['entity']]: React.ReactNode } = {
    customer: <UsersIcon className="h-5 w-5 text-blue-500" />,
    service: <ClipboardListIcon className="h-5 w-5 text-green-500" />,
    salonHours: <ClockIcon className="h-5 w-5 text-purple-500" />,
    visuals: <ImageIcon className="h-5 w-5 text-orange-500" />,
    assistant: <SparklesIcon className="h-5 w-5 text-pink-500" />,
    appointment: <CalendarIcon className="h-5 w-5 text-indigo-500" />,
    finance: <DollarIcon className="h-5 w-5 text-teal-500" />,
    subscription: <StarIcon className="h-5 w-5 text-yellow-500" />,
};

const ActionHistoryManager: React.FC<ActionHistoryManagerProps> = ({ logs, onBack }) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        user: 'all',
        searchTerm: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;

    const filteredLogs = useMemo(() => {
        setIsLoading(true);
        const start = filters.startDate ? new Date(filters.startDate) : null;
        if(start) start.setHours(0,0,0,0);

        const end = filters.endDate ? new Date(filters.endDate) : null;
        if(end) end.setHours(23,59,59,999);
        
        const filtered = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            if (start && logDate < start) return false;
            if (end && logDate > end) return false;
            if (filters.user !== 'all' && log.user !== filters.user) return false;
            if (filters.searchTerm && !log.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
            return true;
        });
        
        // Simulate loading delay
        setTimeout(() => setIsLoading(false), 300);

        return filtered;
    }, [logs, filters]);

    const paginatedLogs = useMemo(() => {
        return filteredLogs.slice(0, page * itemsPerPage);
    }, [filteredLogs, page, itemsPerPage]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset page on filter change
    };

    const setDateRange = (days: number | null) => {
        const end = new Date();
        const start = new Date();
        if (days !== null) {
            start.setDate(end.getDate() - days);
            setFilters(prev => ({
                ...prev,
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
            }));
        } else {
             setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));
        }
        setPage(1);
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800">
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Histórico de Ações</h3>
            </header>
            
            <div className="bg-white/80 border border-gray-200 rounded-xl p-4 mb-4 flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Período</label>
                        <div className="flex gap-1">
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm" />
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm" />
                        </div>
                        <div className="flex gap-2 mt-1">
                           { [0, 6, 29].map(d => <button key={d} onClick={() => setDateRange(d)} className="text-xs text-pink-600 hover:underline">Últimos {d+1}d</button>)}
                        </div>
                    </div>
                    <div>
                         <label htmlFor="user-filter" className="text-sm font-medium text-gray-600 mb-1 block">Usuário</label>
                         <select id="user-filter" name="user" value={filters.user} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500">
                             <option value="all">Todos</option>
                             <option value="Admin">Admin</option>
                             {/* Mock users for demo */}
                             <option value="Profissional 1">Profissional 1</option>
                         </select>
                    </div>
                     <div>
                         <label htmlFor="search-term" className="text-sm font-medium text-gray-600 mb-1 block">Buscar na descrição</label>
                         <input id="search-term" type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder="Ex: 'Corte Feminino'" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" />
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={() => window.print()} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors" title="Imprimir"><PrintIcon /></button>
                         <button onClick={() => alert('Exportar para PDF (Funcionalidade indisponível)')} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors" title="Exportar PDF"><FilePdfIcon /></button>
                         <button onClick={() => alert('Exportar para CSV (Funcionalidade indisponível)')} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors" title="Exportar CSV"><FileCsvIcon /></button>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 pb-4">
                <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                    {isLoading ? <p className="p-8 text-center text-gray-500">Carregando histórico...</p> :
                    paginatedLogs.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {paginatedLogs.map(log => (
                                <li key={log.id} className="p-4 flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                                        {entityIcons[log.entity]}
                                    </div>
                                    <div>
                                        <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: log.description }} />
                                        <p className="text-xs text-gray-500 mt-1">
                                            por <strong>{log.user}</strong> em {new Date(log.timestamp).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-8 text-center text-gray-500">Nenhuma ação encontrada para os filtros selecionados.</p>
                    )}
                </div>
                 {filteredLogs.length > paginatedLogs.length && (
                    <div className="text-center mt-4">
                        <button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-pink-100 text-pink-700 font-semibold rounded-lg hover:bg-pink-200 transition-colors">
                            Carregar Mais
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionHistoryManager;