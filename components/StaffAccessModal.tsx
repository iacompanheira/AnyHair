// components/StaffAccessModal.tsx
import React, { useState, useMemo } from 'react';
import type { Employee, Appointment, PaymentMethod, AppointmentStatus } from '../types';
import { toYYYYMMDD } from '../utils/date';
// FIX: Add CalendarIcon to the import list.
import { CloseIcon, UserIcon, LockClosedIcon, CheckIcon, UserMinusIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, PrintIcon, DownloadIcon, ShareIcon, CalendarIcon } from './Icons';

const MASTER_PASSWORD = '1234'; // Simple password for this feature

interface StaffAccessModalProps {
    onClose: () => void;
    employees: Employee[];
    appointments: Appointment[];
    onAppointmentsChange: (appointments: Appointment[]) => void;
}

const StaffAccessModal: React.FC<StaffAccessModalProps> = ({ onClose, employees, appointments, onAppointmentsChange }) => {
    const [view, setView] = useState<'select_profile' | 'login' | 'agenda'>('select_profile');
    const [profileType, setProfileType] = useState<'professional' | 'admin'>('professional');
    const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [agendaProfessional, setAgendaProfessional] = useState('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [paymentModalApt, setPaymentModalApt] = useState<Appointment | null>(null);

    const professionals = useMemo(() => employees.filter(e => e.accessLevel === 'Profissional'), [employees]);
    const admins = useMemo(() => employees.filter(e => e.accessLevel === 'Administrador' || e.accessLevel === 'Super Administrador'), [employees]);

    const handleSelectUser = (user: Employee) => {
        setSelectedUser(user);
        setView('login');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === MASTER_PASSWORD) {
            setLoginError(null);
            setPassword('');
            if (selectedUser?.accessLevel === 'Profissional') {
                setAgendaProfessional(selectedUser.name);
            } else {
                setAgendaProfessional('all');
            }
            setView('agenda');
        } else {
            setLoginError('Senha incorreta. Tente novamente.');
        }
    };
    
    const handleLogout = () => {
        setSelectedUser(null);
        setView('select_profile');
    };

    const handleUpdateStatus = (aptId: string, status: AppointmentStatus, paymentInfo: Partial<Appointment> = {}) => {
        setUpdatingId(aptId);
        onAppointmentsChange(
            appointments.map(apt => apt.id === aptId ? { ...apt, status, ...paymentInfo } : apt)
        );
        setTimeout(() => setUpdatingId(null), 500);
    };
    
    const handlePayment = (method: PaymentMethod) => {
        if (!paymentModalApt) return;
        handleUpdateStatus(paymentModalApt.id, 'Concluído', { paymentStatus: 'Pago', paymentMethod: method });
        setPaymentModalApt(null);
    };

    const dailyAppointments = useMemo(() => {
        const dateStr = toYYYYMMDD(selectedDate);
        return appointments
            .filter(apt => apt.date === dateStr)
            .filter(apt => agendaProfessional === 'all' || apt.professional === agendaProfessional)
            .sort((a,b) => a.time.localeCompare(b.time));
    }, [selectedDate, appointments, agendaProfessional]);

    const changeDate = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + offset);
        setSelectedDate(newDate);
    };

    const renderView = () => {
        switch (view) {
            case 'login':
                return (
                    <>
                        <button onClick={() => setView('select_profile')} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800"><ArrowLeftIcon/></button>
                        <div className="flex flex-col items-center p-8">
                            <div className="w-24 h-24 rounded-full mb-4 border-2 border-pink-500/50">
                                {selectedUser?.imageUrl ? <img src={selectedUser.imageUrl} alt={selectedUser.name} className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-full h-full text-gray-400 p-3"/>}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">{selectedUser?.name}</h3>
                            <p className="text-gray-500 mb-6">{selectedUser?.accessLevel}</p>
                            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
                                <div className="relative">
                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha de acesso" className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                                </div>
                                {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                                <button type="submit" className="w-full py-2 bg-pink-500 text-white font-bold text-lg rounded-lg hover:bg-pink-600 transition-colors">Entrar</button>
                            </form>
                        </div>
                    </>
                );
            case 'agenda':
                const statusListItemStyles: Record<AppointmentStatus, string> = {
                    'Agendado': 'border-l-4 border-gray-300 hover:bg-gray-50',
                    'Concluído': 'border-l-4 border-green-500 bg-green-200 hover:bg-green-300',
                    'Cancelado': 'border-l-4 border-red-500 bg-red-200 hover:bg-red-300',
                    'Não Compareceu': 'border-l-4 border-yellow-500 bg-yellow-200 hover:bg-yellow-300',
                };

                const statusBadgeStyles: Record<AppointmentStatus, string> = {
                    'Agendado': 'bg-blue-500 text-white',
                    'Concluído': 'bg-green-600 text-white',
                    'Cancelado': 'bg-red-600 text-white',
                    'Não Compareceu': 'bg-yellow-500 text-white',
                };
                return (
                    <div className="w-full h-full flex flex-col">
                        <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200">
                             <h3 className="text-xl font-bold text-gray-800">Minha Agenda</h3>
                             <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Sair</button>
                        </header>
                         <div className="flex-shrink-0 flex flex-wrap justify-between items-center p-3 gap-2 border-b border-gray-200">
                            <div className="flex items-center gap-1">
                                <button onClick={() => changeDate(-1)} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeftIcon className="text-gray-600"/></button>
                                <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 bg-gray-800 text-white rounded-md text-sm font-semibold">Hoje</button>
                                <button onClick={() => changeDate(1)} className="p-2 rounded-md hover:bg-gray-100"><ChevronRightIcon className="text-gray-600"/></button>
                                <button className="p-2 rounded-md hover:bg-gray-100"><CalendarIcon className="w-5 h-5 text-gray-600"/></button>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <button className="p-2 rounded-full hover:bg-gray-200"><PrintIcon /></button>
                                <button className="p-2 rounded-full hover:bg-gray-200"><DownloadIcon /></button>
                                <button className="p-2 rounded-full hover:bg-gray-200"><ShareIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="text-center p-2 font-semibold text-gray-700">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>

                         {selectedUser?.accessLevel !== 'Profissional' && (
                             <div className="flex-shrink-0 px-3 pb-3 border-b border-gray-200">
                                <select value={agendaProfessional} onChange={e => setAgendaProfessional(e.target.value)} className="w-full p-2 bg-gray-100 border border-gray-300 text-gray-800 rounded-md">
                                    <option value="all">Todos os Profissionais</option>
                                    {professionals.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                         )}
                        <ul className="flex-grow overflow-y-auto divide-y divide-gray-200">
                            {dailyAppointments.length > 0 ? dailyAppointments.map(apt => (
                                <li key={apt.id} className={`p-4 transition-all duration-300 ${statusListItemStyles[apt.status]} ${updatingId === apt.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-start gap-4">
                                        <p className="w-16 text-center text-xl font-bold text-gray-800">{apt.time}</p>
                                        <div className="flex-grow">
                                            <p className="font-bold text-lg text-gray-900">{apt.customerName}</p>
                                            <p className="text-base text-gray-700">{apt.serviceName}</p>
                                            {agendaProfessional === 'all' && (
                                                <p className="text-sm text-gray-500">{apt.professional}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${statusBadgeStyles[apt.status]}`}>{apt.status}</span>
                                                {apt.status === 'Concluído' && (
                                                    apt.paymentStatus === 'Pago' ? (
                                                        <span className="text-sm font-semibold px-2 py-1 bg-green-600 text-white rounded-full">Pago ({apt.paymentMethod})</span>
                                                    ) : (
                                                        <span className="text-sm font-semibold px-2 py-1 bg-yellow-500 text-white rounded-full">Pendente</span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col items-end gap-1.5 w-28">
                                            {apt.status === 'Agendado' && (
                                                <>
                                                    <button onClick={() => setPaymentModalApt(apt)} className="w-full text-sm py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600">Concluir</button>
                                                    <button onClick={() => handleUpdateStatus(apt.id, 'Não Compareceu')} className="w-full text-sm py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Faltou</button>
                                                    <button onClick={() => handleUpdateStatus(apt.id, 'Cancelado')} className="w-full text-sm py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600">Cancelar</button>
                                                </>
                                            )}
                                            {apt.status === 'Concluído' && apt.paymentStatus === 'Pendente' && (
                                                <button onClick={() => setPaymentModalApt(apt)} className="px-3 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600">Reg. Pagamento</button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            )) : <li className="p-8 text-center text-gray-500">Nenhum agendamento para este dia.</li>}
                        </ul>
                    </div>
                );

            default: // select_profile
                return (
                    <div className="w-full h-full flex flex-col p-4">
                        <h2 className="text-2xl font-bold text-gray-800 text-center flex-shrink-0 pb-2">Acesso da Equipe</h2>
                        <div className="flex border-b border-gray-200 mb-4">
                             <button onClick={() => setProfileType('professional')} className={`flex-1 py-2 font-semibold ${profileType === 'professional' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-500'}`}>Profissional</button>
                             <button onClick={() => setProfileType('admin')} className={`flex-1 py-2 font-semibold ${profileType === 'admin' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-500'}`}>Administrativo</button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {profileType === 'professional' ? (
                                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {professionals.map(p => (
                                        <div key={p.id} onClick={() => handleSelectUser(p)} className="text-center cursor-pointer p-2 rounded-lg hover:bg-gray-100">
                                            <div className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-gray-200">
                                                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-full h-full text-gray-400 p-3"/>}
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.specialty}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {admins.map(a => (
                                        <div key={a.id} onClick={() => handleSelectUser(a)} className="text-center cursor-pointer p-2 rounded-lg hover:bg-gray-100">
                                            <div className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-gray-200">
                                                {a.imageUrl ? <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-full h-full text-gray-400 p-3"/>}
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800 truncate">{a.name}</p>
                                            <p className="text-xs text-gray-500">{a.accessLevel}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-lg h-[90vh] max-h-[700px] bg-white text-gray-800 rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 rounded-full z-10" aria-label="Fechar"><CloseIcon /></button>
                {renderView()}
            </div>
             {paymentModalApt && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPaymentModalApt(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm text-gray-800" onClick={e => e.stopPropagation()}>
                        <header className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold">Registrar Pagamento</h3>
                            <p className="text-sm text-gray-500">{paymentModalApt.serviceName} - R$ {paymentModalApt.price.toFixed(2)}</p>
                        </header>
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {(['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'] as PaymentMethod[]).map(method => 
                                <button key={method} onClick={() => handlePayment(method)} className="py-2 bg-gray-100 font-semibold rounded-lg hover:bg-pink-500 hover:text-white transition-colors">{method}</button>
                            )}
                             <button onClick={() => handlePayment('Outro')} className="py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">Outro método</button>
                        </div>
                        <footer className="p-3 bg-gray-50 border-t rounded-b-xl grid grid-cols-2 gap-3">
                           <button onClick={() => { handleUpdateStatus(paymentModalApt.id, 'Concluído', { paymentStatus: 'Pendente' }); setPaymentModalApt(null); }} className="w-full py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm">Concluir sem Pagar</button>
                           <button onClick={() => setPaymentModalApt(null)} className="w-full py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm">Cancelar</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffAccessModal;