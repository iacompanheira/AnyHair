import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Employee, Service } from '../../types';
import SaveBar from './SaveBar';
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon, CloseIcon, UserIcon } from './Icons';
import ToggleSwitch from './ToggleSwitch';
import { generateUUID } from '../../utils/date';

interface EmployeeManagerProps {
    employees: Employee[];
    onEmployeesChange: (employees: Employee[]) => void;
    services: Service[];
    onBack: () => void;
}

const accessLevelColors: Record<Employee['accessLevel'], string> = {
    'Super Administrador': 'bg-red-100 text-red-800',
    'Administrador': 'bg-yellow-100 text-yellow-800',
    'Profissional': 'bg-blue-100 text-blue-800',
};

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees: initialEmployees, onEmployeesChange, services, onBack }) => {
    const [localEmployees, setLocalEmployees] = useState(initialEmployees);
    const [hasChanges, setHasChanges] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> & { password?: string } | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAccessLevel, setFilterAccessLevel] = useState<Employee['accessLevel'] | 'all'>('all');

    const filteredEmployees = useMemo(() => {
        return localEmployees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  emp.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = filterAccessLevel === 'all' || emp.accessLevel === filterAccessLevel;
            return matchesSearch && matchesLevel;
        });
    }, [localEmployees, searchTerm, filterAccessLevel]);

    useEffect(() => {
        setHasChanges(JSON.stringify(localEmployees) !== JSON.stringify(initialEmployees));
    }, [localEmployees, initialEmployees]);

    const handleModalSave = (employeeData: Employee & { password?: string }) => {
        if (employeeData.id) { // Editing
            const { password, ...rest } = employeeData;
            // Password is not stored in state, so we just use the rest of the data
            setLocalEmployees(localEmployees.map(e => e.id === rest.id ? rest : e));
        } else { // Adding
            setLocalEmployees([...localEmployees, { ...employeeData, id: generateUUID() }]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingEmployee({ status: 'Ativo', accessLevel: 'Profissional' });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (id === 'emp_super_admin') {
            alert("O Super Administrador principal não pode ser excluído.");
            return;
        }
        if (window.confirm("Tem certeza que deseja remover este funcionário?")) {
            setLocalEmployees(localEmployees.filter(e => e.id !== id));
        }
    };

    const handleSaveChanges = () => {
        onEmployeesChange(localEmployees);
    };

    const handleBack = () => {
        if (hasChanges && !window.confirm("Você tem alterações não salvas. Deseja descartá-las?")) {
            return;
        }
        onBack();
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col h-full text-gray-800">
            {isModalOpen && editingEmployee && (
                <EmployeeModal
                    employee={editingEmployee}
                    services={services}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleModalSave}
                />
            )}
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={handleBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Gerenciar Funcionários</h3>
                <div className="flex-grow"></div>
                <button onClick={handleAdd} className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors flex items-center"><PlusIcon /> Adicionar</button>
            </header>
            
            <div className="bg-white/80 border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Buscar por nome ou e-mail..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
                <select
                    value={filterAccessLevel}
                    onChange={e => setFilterAccessLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                >
                    <option value="all">Todos os Níveis</option>
                    <option value="Super Administrador">Super Administradores</option>
                    <option value="Administrador">Administradores</option>
                    <option value="Profissional">Profissionais</option>
                </select>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 pb-24">
                <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                    <ul className="divide-y divide-gray-200">
                        {filteredEmployees.map(employee => (
                            <li key={employee.id} className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex-shrink-0 ${employee.imageUrl ? '' : 'bg-gray-200'}`}>
                                        {employee.imageUrl ? (
                                            <img src={employee.imageUrl} alt={employee.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <UserIcon className="w-full h-full text-gray-400 p-2" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                                            {employee.name}
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${accessLevelColors[employee.accessLevel]}`}>{employee.accessLevel}</span>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${employee.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{employee.status}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">{employee.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleEdit(employee)} className="p-2 text-blue-600 hover:text-blue-800"><EditIcon /></button>
                                    <button onClick={() => handleDelete(employee.id)} disabled={employee.id === 'emp_super_admin'} className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"><TrashIcon /></button>
                                </div>
                            </li>
                        ))}
                        {filteredEmployees.length === 0 && <li className="p-8 text-center text-gray-500">Nenhum funcionário encontrado.</li>}
                    </ul>
                </div>
            </div>
            <SaveBar hasChanges={hasChanges} onSave={handleSaveChanges} onCancel={() => setLocalEmployees(initialEmployees)} />
        </div>
    );
};


// --- MODAL COMPONENT ---

const EmployeeModal: React.FC<{ employee: Partial<Employee> & { password?: string }, services: Service[], onClose: () => void, onSave: (employee: any) => void }> = ({ employee, services, onClose, onSave }) => {
    const [draft, setDraft] = useState(employee);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDraft(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setDraft(prev => ({...prev, imageUrl: e.target?.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleServiceToggle = (serviceId: string) => {
        setDraft(prev => {
            const currentServices = prev.servicesPerformed || [];
            const newServices = currentServices.includes(serviceId)
                ? currentServices.filter(id => id !== serviceId)
                : [...currentServices, serviceId];
            return { ...prev, servicesPerformed: newServices };
        });
    };

    const handleSave = () => {
        if (!draft.name || !draft.email) {
            alert("Nome e e-mail são obrigatórios.");
            return;
        }
        if (!draft.id && !draft.password) {
            alert("Senha é obrigatória para novos funcionários.");
            return;
        }
        onSave(draft);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl text-gray-800 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{draft.id ? 'Editar' : 'Adicionar'} Funcionário</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-2">
                            <label className="block text-sm font-medium text-gray-600">Imagem do Perfil</label>
                            <div className="relative w-32 h-32 mx-auto">
                                {draft.imageUrl ? (
                                    <>
                                        <img src={draft.imageUrl} alt="Perfil" className="w-full h-full object-cover rounded-full" />
                                        <button onClick={() => setDraft(prev => ({...prev, imageUrl: ''}))} className="absolute top-0 right-0 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"><TrashIcon/></button>
                                    </>
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                                        <UserIcon className="w-16 h-16 text-gray-400"/>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="w-full text-sm text-center py-2 bg-gray-200 rounded-md hover:bg-gray-300">Carregar</button>
                            <input type="text" name="imageUrl" placeholder="Ou cole a URL da imagem" value={draft.imageUrl} onChange={handleChange} className="w-full text-sm px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nome Completo</label>
                                <input type="text" name="name" value={draft.name || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">E-mail</label>
                                    <input type="email" name="email" value={draft.email || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">WhatsApp</label>
                                    <input type="tel" name="whatsapp" value={draft.whatsapp || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Access & Status */}
                    <div className="border-t pt-4 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nível de Acesso</label>
                                <select name="accessLevel" value={draft.accessLevel} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                                    <option value="Profissional">Profissional</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Super Administrador">Super Administrador</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                <div className="flex items-center gap-4 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                                    <ToggleSwitch enabled={draft.status === 'Ativo'} onChange={(active) => setDraft(prev => ({...prev, status: active ? 'Ativo' : 'Inativo' }))} />
                                    <span>{draft.status}</span>
                                </div>
                             </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Senha</label>
                            <input type="password" name="password" placeholder={draft.id ? "Deixe em branco para manter a atual" : "Obrigatório"} value={draft.password || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                         </div>
                    </div>
                    {/* Professional Settings */}
                    {draft.accessLevel === 'Profissional' && (
                        <div className="border-t pt-4 space-y-4 animate-fade-in">
                            <h4 className="text-md font-semibold text-gray-700">Configurações de Profissional</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Especialidade</label>
                                    <input type="text" name="specialty" placeholder="Ex: Cabeleireiro, Manicure" value={draft.specialty || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Ordem de Exibição</label>
                                    <input type="number" name="displayOrder" value={draft.displayOrder || 99} onChange={(e) => setDraft(prev => ({...prev, displayOrder: parseInt(e.target.value, 10)}))} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Serviços Realizados</label>
                                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-gray-50 border border-gray-300 rounded-md">
                                    {services.map(service => (
                                        <label key={service.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                            <input type="checkbox" checked={(draft.servicesPerformed || []).includes(service.id)} onChange={() => handleServiceToggle(service.id)} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                                            <span>{service.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <footer className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600">Salvar</button>
                </footer>
            </div>
        </div>
    );
};

export default EmployeeManager;
