// components/dashboard/RaffleManager.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Customer, Employee, Appointment, RaffleWinner } from '../../types';
import { ArrowLeftIcon, InfoIcon, SendIcon, UserIcon } from './Icons';

interface RaffleManagerProps {
    customers: Customer[];
    employees: Employee[];
    appointments: Appointment[];
    onBack: () => void;
}

type Participant = { 
    id: string; 
    name: string; 
    imageUrl?: string; 
    type: 'customer' | 'employee', 
    lastVisit?: Date 
}

const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<React.ReactNode[]>([]);

    useEffect(() => {
        const newPieces = Array.from({ length: 150 }).map((_, i) => {
            const style: React.CSSProperties = {
                left: `${Math.random() * 100}%`,
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                transform: `rotate(${Math.random() * 360}deg)`
            };
            return <div key={i} className="confetti" style={style}></div>;
        });
        setPieces(newPieces);
    }, []);

    return <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">{pieces}</div>;
};

const RaffleManager: React.FC<RaffleManagerProps> = ({ customers, employees, appointments, onBack }) => {
    const [raffleHistory, setRaffleHistory] = useState<RaffleWinner[]>([]);
    const [activeTab, setActiveTab] = useState<'customers' | 'employees'>('customers');
    const [customerFilter, setCustomerFilter] = useState<'3m' | '6m' | '12m' | 'all'>('all');
    const [prize, setPrize] = useState<string>('');
    const [isRaffling, setIsRaffling] = useState<boolean>(false);
    const [shuffledName, setShuffledName] = useState<string | null>(null);
    const [winner, setWinner] = useState<Participant | null>(null);
    const [historySearchTerm, setHistorySearchTerm] = useState<string>('');

    const raffleIntervalRef = useRef<number | null>(null);

    const customerLastVisitMap = useMemo(() => {
        const map = new Map<string, Date>();
        [...appointments]
            .filter(a => a.status === 'Concluído' && a.customerId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .forEach(a => {
                if (!map.has(a.customerId)) {
                    map.set(a.customerId, new Date(a.date));
                }
            });
        return map;
    }, [appointments]);

    const eligibleParticipants = useMemo(() => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const recentWinnerIds = new Set(
            raffleHistory
                .filter(winner => new Date(winner.date) > oneYearAgo)
                .map(winner => winner.id)
        );

        let baseList: Participant[] = [];
        if (activeTab === 'customers') {
            baseList = customers.map(c => ({
                id: c.id,
                name: c.name,
                imageUrl: '',
                type: 'customer',
                lastVisit: customerLastVisitMap.get(c.id)
            }));
        } else {
            baseList = employees
                .filter(e => e.accessLevel === 'Profissional' && e.status === 'Ativo')
                .map(e => ({
                    id: e.id,
                    name: e.name,
                    imageUrl: e.imageUrl,
                    type: 'employee'
                }));
        }

        let filteredList = baseList.filter(p => !recentWinnerIds.has(p.id));

        if (activeTab === 'customers' && customerFilter !== 'all') {
            const months = customerFilter === '3m' ? 3 : customerFilter === '6m' ? 6 : 12;
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - months);
            filteredList = filteredList.filter(p => p.lastVisit && p.lastVisit > cutoffDate);
        }
        
        return filteredList;
    }, [activeTab, customerFilter, customers, employees, customerLastVisitMap, raffleHistory]);

    const handleRaffle = () => {
        if (eligibleParticipants.length < 2) {
            alert("São necessários pelo menos 2 participantes elegíveis para realizar o sorteio.");
            return;
        }
        setIsRaffling(true);
        setWinner(null);

        raffleIntervalRef.current = window.setInterval(() => {
            const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
            setShuffledName(eligibleParticipants[randomIndex].name);
        }, 75);

        setTimeout(() => {
            if (raffleIntervalRef.current) clearInterval(raffleIntervalRef.current);
            
            const winnerIndex = Math.floor(Math.random() * eligibleParticipants.length);
            const finalWinner = eligibleParticipants[winnerIndex];
            setWinner(finalWinner);
            setIsRaffling(false);
            setShuffledName(null);

            setRaffleHistory(prev => [{
                id: finalWinner.id,
                name: finalWinner.name,
                imageUrl: finalWinner.imageUrl,
                type: finalWinner.type,
                date: new Date().toISOString(),
                prize: prize || 'Não especificado'
            }, ...prev]);

        }, 3000);
    };
    
    const handleReset = () => {
        setWinner(null);
        setShuffledName(null);
        if (raffleIntervalRef.current) clearInterval(raffleIntervalRef.current);
        setIsRaffling(false);
    };

    const filteredHistory = useMemo(() => {
        return raffleHistory.filter(h => h.name.toLowerCase().includes(historySearchTerm.toLowerCase()));
    }, [raffleHistory, historySearchTerm]);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full text-gray-800">
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Realizar Sorteio</h3>
            </header>

            <div className="flex-grow overflow-y-auto pr-2 pb-4 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Configuration */}
                    <div className="bg-white/80 border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">1. Configuração</h3>
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Público do Sorteio</label>
                            <div className="flex bg-gray-200 rounded-lg p-1">
                                <button onClick={() => setActiveTab('customers')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition-colors ${activeTab === 'customers' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-600'}`}>Clientes</button>
                                <button onClick={() => setActiveTab('employees')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition-colors ${activeTab === 'employees' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-600'}`}>Funcionários</button>
                            </div>
                        </div>
                        {activeTab === 'customers' && (
                            <div className="animate-fade-in">
                                <label className="text-sm font-medium text-gray-600 mb-2 block">Filtrar clientes por última visita</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['all', '12m', '6m', '3m'].map(value => (
                                        <button key={value} onClick={() => setCustomerFilter(value as any)} className={`p-2 rounded-md font-semibold text-sm transition-colors ${customerFilter === value ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                            {value === 'all' ? 'Todos' : `Últimos ${value.replace('m','')} meses`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Prêmio (opcional)</label>
                            <input type="text" value={prize} onChange={e => setPrize(e.target.value)} placeholder="Ex: Voucher de R$100" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"/>
                        </div>
                    </div>
                    {/* Right: Execution */}
                    <div className="bg-white/80 border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                        {winner && <Confetti />}
                        <h3 className="text-lg font-semibold text-gray-700">2. Sorteio</h3>
                        <div className="flex items-center gap-2 my-2">
                            <span className="font-bold text-3xl text-pink-500">{eligibleParticipants.length}</span>
                            <span className="text-gray-600">participantes elegíveis</span>
                            <div className="group relative">
                                <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-700 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Pessoas que ganharam um sorteio no último ano são inelegíveis.
                                </div>
                            </div>
                        </div>
                        <div className="h-24 my-4 flex items-center justify-center">
                            {isRaffling && <p className="text-2xl font-bold text-gray-700 animate-pulse">{shuffledName}</p>}
                            {winner && (
                                <div className="animate-zoom-in text-center">
                                    <div className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-pink-500 shadow-lg">
                                        {winner.imageUrl ? <img src={winner.imageUrl} alt={winner.name} className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-full h-full text-gray-400 p-2 bg-gray-100 rounded-full"/>}
                                    </div>
                                    <p className="font-bold text-xl text-pink-600">{winner.name}</p>
                                    <p className="text-gray-600">foi a pessoa sorteada!</p>
                                </div>
                            )}
                        </div>
                        <button onClick={winner ? handleReset : handleRaffle} disabled={isRaffling} className="w-full max-w-xs px-6 py-3 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-400">
                            {isRaffling ? 'Sorteando...' : winner ? 'Sortear Novamente' : 'Sortear'}
                        </button>
                        {winner && (
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => alert(`Voucher para ${winner.name}!`)} className="px-3 py-1.5 text-sm font-semibold bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center gap-1"><SendIcon/> Enviar Voucher</button>
                                <button onClick={() => alert(`Ver perfil de ${winner.name}!`)} className="px-3 py-1.5 text-sm font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-1"><UserIcon className="w-4 h-4"/> Ver Perfil</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* History */}
                <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Histórico de Sorteios</h3>
                        <input type="text" placeholder="Buscar vencedor..." value={historySearchTerm} onChange={e => setHistorySearchTerm(e.target.value)} className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md w-64 text-sm"/>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2">Vencedor(a)</th>
                                    <th className="px-4 py-2 hidden md:table-cell">Tipo</th>
                                    <th className="px-4 py-2">Prêmio</th>
                                    <th className="px-4 py-2 hidden md:table-cell">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((h, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-2 font-medium flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full flex-shrink-0">{h.imageUrl ? <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-full h-full text-gray-400 p-1 bg-gray-100 rounded-full"/>}</div>
                                            {h.name}
                                        </td>
                                        <td className="px-4 py-2 hidden md:table-cell">{h.type === 'customer' ? 'Cliente' : 'Funcionário'}</td>
                                        <td className="px-4 py-2">{h.prize}</td>
                                        <td className="px-4 py-2 hidden md:table-cell">{new Date(h.date).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredHistory.length === 0 && <p className="text-center text-gray-500 py-6">Nenhum sorteio realizado ainda.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RaffleManager;