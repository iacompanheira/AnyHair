// Dashboard.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { BackgroundSettings, OverlaySettings, TitleSettings, HeaderSettings, CTAButtonSettings, Service, Customer, Employee, SalonHoursSettings, AuditLog, Appointment, MemoryBoxSettings, Material, ServiceRecipe, Combo, CostSettings, Transaction, SubscriptionPlan, SubscriptionSettings } from './types';
import { APP_FEATURES } from './constants/initialData';

import DashboardCard from './components/dashboard/DashboardCard';
import SaveBar from './components/dashboard/SaveBar';
import BackgroundManager from './components/dashboard/BackgroundManager';
import ServiceManager from './components/dashboard/ServiceManager';
import CustomerManager from './components/dashboard/CustomerManager';
import EmployeeManager from './components/dashboard/EmployeeManager';
import AssistantManager from './components/dashboard/AssistantManager';
import SalonHoursManager from './components/dashboard/SalonHoursManager';
import AppointmentManager from './components/dashboard/AppointmentManager';
import FullCalendarView from './components/dashboard/FullCalendarView';
import ActionHistoryManager from './components/dashboard/ActionHistoryManager';
import FinanceManager from './components/dashboard/FinanceManager';
import MaterialsPanel from './components/dashboard/MaterialsPanel';
import IndividualServicesPanel from './components/dashboard/pricing/IndividualServicesPanel';
import SubscriptionManager from './components/dashboard/subscriptions/SubscriptionManager';
import ReportsScreen from './components/dashboard/reports/ReportsScreen';
import CommissionReportScreen from './components/dashboard/reports/CommissionReportScreen';
import FeatureSubscriptionManager from './components/dashboard/subscriptions/FeatureSubscriptionManager';
import RaffleManager from './components/dashboard/RaffleManager';
import { UsersIcon, ClipboardListIcon, ImageIcon, SparklesIcon, CloseIcon, ClockIcon, HistoryIcon, DollarIcon, CalendarIcon, BriefcaseIcon, TagIcon, ArchiveBoxIcon, StarIcon, BarChartIcon, GiftIcon, ReceiptPercentIcon, ShieldCheckIcon, HomeIcon, ChevronLeftIcon, ChevronRightIcon } from './components/dashboard/Icons';


// --- Prop Interfaces ---
type Settings = {
    backgrounds: BackgroundSettings[];
    isRotationEnabled: boolean;
    rotationInterval: number;
    transitionDuration: number;
    transitionStyle: string;
    visualizerStyle: number;
    overlaySettings: OverlaySettings;
    titleSettings: TitleSettings;
    headerSettings: HeaderSettings;
    micGain: number;
    isNoiseReductionEnabled: boolean;
    ctaSettings: CTAButtonSettings;
    cardOrder: string[];
}

interface DashboardProps extends Omit<Settings, 'cardOrder'> {
    onClose: () => void;
    onBackgroundsChange: (bgs: BackgroundSettings[]) => void;
    onRotationToggle: (enabled: boolean) => void;
    onRotationIntervalChange: (ms: number) => void;
    onTransitionDurationChange: (ms: number) => void;
    onTransitionStyleChange: (style: string) => void;
    onVisualizerStyleChange: (styleId: number) => void;
    onOverlaySettingsChange: (settings: OverlaySettings) => void;
    onTitleSettingsChange: (settings: TitleSettings) => void;
    onHeaderSettingsChange: (settings: HeaderSettings) => void;
    onMicGainChange: (gain: number) => void;
    onNoiseReductionToggle: (enabled: boolean) => void;
    onCtaSettingsChange: (settings: CTAButtonSettings) => void;
    cardOrder: string[];
    onCardOrderChange: (order: string[]) => void;
    services: Service[];
    onServicesChange: (services: Service[]) => void;
    employees: Employee[];
    onEmployeesChange: (employees: Employee[]) => void;
    customers: Customer[];
    onCustomersChange: (customers: Customer[]) => void;
    appointments: Appointment[];
    onAppointmentsChange: (appointments: Appointment[]) => void;
    transactions: Transaction[];
    onTransactionsChange: (transactions: Transaction[]) => void;
    materials: Material[];
    onMaterialsChange: (materials: Material[]) => void;
    serviceRecipes: ServiceRecipe[];
    onServiceRecipesChange: (recipes: ServiceRecipe[]) => void;
    combos: Combo[];
    onCombosChange: (combos: Combo[]) => void;
    subscriptionPlans: SubscriptionPlan[];
    onSubscriptionPlansChange: (plans: SubscriptionPlan[]) => void;
    subscriptionSettings: SubscriptionSettings;
    onSubscriptionSettingsChange: (settings: SubscriptionSettings) => void;
    costSettings: CostSettings;
    onCostSettingsChange: (settings: CostSettings) => void;
    isMemoryEnabled: boolean;
    onMemoryEnabledChange: (enabled: boolean) => void;
    memoryText: string;
    onMemoryTextChange: (text: string) => void;
    memoryBoxSettings: MemoryBoxSettings;
    onMemoryBoxSettingsChange: (settings: MemoryBoxSettings) => void;
    salonHoursSettings: SalonHoursSettings;
    onSalonHoursSettingsChange: (settings: SalonHoursSettings) => void;
    auditLogs: AuditLog[];
    onAddLog: (entity: AuditLog['entity'], description: string) => void;
    costPerMinute: number;
}


const allCardsConfig = [
    { id: 'home', icon: <HomeIcon />, title: "Início", description: "Visão geral do painel." },
    { id: 'reports', icon: <BarChartIcon />, title: "Relatórios", description: "Analise o desempenho e métricas do seu negócio." },
    { id: 'appointments', icon: <CalendarIcon />, title: "Agenda do Dia", description: "Gerencie os agendamentos de um dia específico." },
    { id: 'calendar', icon: <CalendarIcon />, title: "Calendário Completo", description: "Visão panorâmica mensal da agenda do salão." },
    { id: 'customers', icon: <UsersIcon />, title: "Clientes", description: "Gerencie seus clientes e agendamentos." },
    { id: 'employees', icon: <BriefcaseIcon />, title: "Funcionários", description: "Gerencie a equipe de profissionais." },
    { id: 'finance', icon: <DollarIcon />, title: "Finanças e Custos", description: "Visão geral, fluxo de caixa e configuração de custos." },
    { id: 'pricing', icon: <TagIcon />, title: "Precificação", description: "Defina preços, receitas e pacotes de serviços." },
    { id: 'inventory', icon: <ArchiveBoxIcon />, title: "Estoque de Materiais", description: "Gerencie o inventário de produtos e materiais." },
    { id: 'commissions', icon: <ReceiptPercentIcon />, title: "Relatório de Comissões", description: "Analise o faturamento e comissões dos profissionais." },
    { id: 'services', icon: <ClipboardListIcon />, title: "Catálogo de Serviços", description: "Visualize os serviços e pacotes oferecidos." },
    { id: 'subscriptions', icon: <StarIcon />, title: "Planos de Assinatura", description: "Crie e gerencie planos de assinatura mensais." },
    { id: 'raffles', icon: <GiftIcon />, title: "Sorteios", description: "Realize sorteios para clientes e funcionários." },
    { id: 'salonHours', icon: <ClockIcon />, title: "Horário do Salão", description: "Defina o horário de funcionamento e feriados." },
    { id: 'visuals', icon: <ImageIcon />, title: "Visual", description: "Personalize a aparência da tela inicial." },
    { id: 'assistant', icon: <SparklesIcon />, title: "Assistente IA", description: "Defina a persona e interaja com a IA." },
    { id: 'history', icon: <HistoryIcon />, title: "Histórico de Ações", description: "Audite e monitore as atividades." },
];

// --- Main Dashboard Component ---
const Dashboard: React.FC<DashboardProps> = (props) => {
    const { 
        onClose,
        onBackgroundsChange,
        onRotationToggle,
        onRotationIntervalChange,
        onTransitionDurationChange,
        onTransitionStyleChange,
        onVisualizerStyleChange,
        onOverlaySettingsChange,
        onTitleSettingsChange,
        onHeaderSettingsChange,
        onMicGainChange,
        onNoiseReductionToggle,
        onCtaSettingsChange,
        cardOrder: initialCardOrder,
        onCardOrderChange,
        services,
        onServicesChange,
        employees,
        onEmployeesChange,
        customers,
        onCustomersChange,
        appointments,
        onAppointmentsChange,
        transactions,
        onTransactionsChange,
        materials,
        onMaterialsChange,
        serviceRecipes,
        onServiceRecipesChange,
        combos,
        onCombosChange,
        subscriptionPlans,
        onSubscriptionPlansChange,
        subscriptionSettings,
        onSubscriptionSettingsChange,
        costSettings,
        onCostSettingsChange,
        isMemoryEnabled,
        onMemoryEnabledChange,
        memoryText,
        onMemoryTextChange,
        memoryBoxSettings,
        onMemoryBoxSettingsChange,
        salonHoursSettings,
        onSalonHoursSettingsChange,
        auditLogs,
        onAddLog,
        costPerMinute,
        ...initialSettings
    } = props;
    
    const [view, setView] = useState<string>('home');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [localSettings, setLocalSettings] = useState<Settings>({ ...initialSettings, cardOrder: initialCardOrder });
    const [hasChanges, setHasChanges] = useState(false);
    
    const isSuperAdmin = useMemo(() => employees.some(e => e.accessLevel === 'Super Administrador'), [employees]);

    // Drag and Drop refs for the home screen
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    useEffect(() => {
        setHasChanges(JSON.stringify({ ...localSettings, cardOrder: localSettings.cardOrder }) !== JSON.stringify({ ...initialSettings, cardOrder: initialCardOrder }));
    }, [localSettings, initialSettings, initialCardOrder]);

    
    const handleSettingsChange = (newSettings: Partial<Settings>) => {
        setLocalSettings(prev => ({ ...prev, ...newSettings }));
    };

    const handleSaveVisuals = () => {
        onBackgroundsChange(localSettings.backgrounds);
        onRotationToggle(localSettings.isRotationEnabled);
        onRotationIntervalChange(localSettings.rotationInterval);
        onTransitionDurationChange(localSettings.transitionDuration);
        onTransitionStyleChange(localSettings.transitionStyle);
        onVisualizerStyleChange(localSettings.visualizerStyle);
        onOverlaySettingsChange(localSettings.overlaySettings);
        onTitleSettingsChange(localSettings.titleSettings);
        onHeaderSettingsChange(localSettings.headerSettings);
        onMicGainChange(localSettings.micGain);
        onNoiseReductionToggle(localSettings.isNoiseReductionEnabled);
        onCtaSettingsChange(localSettings.ctaSettings);
        onCardOrderChange(localSettings.cardOrder);
        onAddLog('visuals', 'Configurações de aparência e visuais foram atualizadas.');
        setHasChanges(false);
    };
    
    const handleCancelVisuals = () => {
        setLocalSettings({ ...initialSettings, cardOrder: initialCardOrder });
    };

    const { homeItem, otherNavItems } = useMemo(() => {
        const activeTier = subscriptionSettings.availableTiers.find(t => t.id === subscriptionSettings.activeTierId);
        const enabledFeatureSet = new Set(activeTier?.enabledFeatures || []);
        enabledFeatureSet.add('home'); 

        const allVisibleItems = allCardsConfig
            .filter(card => enabledFeatureSet.has(card.id))
            .map(card => {
                if (card.id === 'home') {
                    return {
                        ...card,
                        onClick: () => setView('home'),
                    };
                }
                return {
                    ...card,
                    onClick: () => setView(card.id)
                };
            });
        
        const homeItem = allVisibleItems.find(item => item.id === 'home');
        const otherNavItems = allVisibleItems.filter(item => item.id !== 'home');

        return { homeItem, otherNavItems };

    }, [subscriptionSettings]);

    const currentViewTitle = useMemo(() => {
        if (view === 'home') return "Visão Geral";
        const card = allCardsConfig.find(c => c.id === view);
        if (card) return card.title;
        if (view === 'featureSubscriptions') return "Gestão de Planos e Recursos";
        return "Painel de Controle";
    }, [view]);

    
    const renderContent = () => {
        switch(view) {
            case 'home':
                const homeCards = otherNavItems;
                const visibleCardsMap = new Map(homeCards.map(c => [c.id, c]));
    
                const orderedVisibleCards = localSettings.cardOrder.reduce<(typeof homeCards[0])[]>((acc, id) => {
                    const card = visibleCardsMap.get(id);
                    if (card) {
                        acc.push(card);
                    }
                    return acc;
                }, []);


                const handleDragSort = () => {
                    if (dragItem.current === null || dragOverItem.current === null) return;
                    
                    const draggedVisibleCard = orderedVisibleCards[dragItem.current];
                    const overVisibleCard = orderedVisibleCards[dragOverItem.current];
                    if (!draggedVisibleCard || !overVisibleCard) return;

                    const draggedId = draggedVisibleCard.id;
                    const overId = overVisibleCard.id;

                    const fullOrder = [...localSettings.cardOrder];
                    const draggedIdIndex = fullOrder.indexOf(draggedId);
                    
                    if (draggedIdIndex === -1) return;

                    fullOrder.splice(draggedIdIndex, 1);
                    const overIdIndex = fullOrder.indexOf(overId);
                    
                    if (overIdIndex === -1) return;

                    fullOrder.splice(overIdIndex, 0, draggedId);

                    handleSettingsChange({ cardOrder: fullOrder });

                    dragItem.current = null;
                    dragOverItem.current = null;
                    setDraggedIndex(null);
                };

                return (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 w-full max-w-7xl">
                        {orderedVisibleCards.map((card, index) => (
                            <div 
                                key={card.id}
                                id={`dashboard-card-${card.id}`}
                                draggable
                                onDragStart={() => { dragItem.current = index; setDraggedIndex(index); }}
                                onDragEnter={() => dragOverItem.current = index}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                                className={`transition-opacity ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                            >
                                <DashboardCard {...card} />
                            </div>
                        ))}
                    </div>
                );
            case 'featureSubscriptions':
                return <FeatureSubscriptionManager settings={subscriptionSettings} onSettingsChange={onSubscriptionSettingsChange} onBack={() => setView('home')} />;
            case 'raffles':
                return <RaffleManager
                    customers={customers}
                    employees={employees}
                    appointments={appointments}
                    onBack={() => setView('home')}
                />;
            case 'reports':
                return <ReportsScreen 
                    appointments={appointments}
                    customers={customers}
                    employees={employees}
                    onBack={() => setView('home')}
                />;
            case 'commissions':
                return <CommissionReportScreen
                    appointments={appointments}
                    employees={employees}
                    onEmployeesChange={onEmployeesChange}
                    costSettings={costSettings}
                    onCostSettingsChange={onCostSettingsChange}
                    onBack={() => setView('home')}
                />;
            case 'appointments':
                return <AppointmentManager
                    appointments={appointments}
                    onAppointmentsChange={onAppointmentsChange}
                    customers={customers}
                    services={services}
                    onBack={() => setView('home')}
                />;
            case 'calendar':
                return <FullCalendarView
                    appointments={appointments}
                    employees={employees}
                    onBack={() => setView('home')}
                />;
            case 'visuals':
                return (
                     <BackgroundManager 
                        settings={localSettings} 
                        onSettingsChange={handleSettingsChange}
                        onBack={() => {
                            if (hasChanges) {
                                if (window.confirm("Você tem alterações não salvas. Deseja descartá-las?")) {
                                     handleCancelVisuals();
                                     setView('home');
                                }
                            } else {
                                setView('home');
                            }
                        }} 
                    />
                );
            case 'services':
                return <ServiceManager services={services} combos={combos} onBack={() => setView('home')} />;
            case 'customers':
                return <CustomerManager customers={customers} onCustomersChange={onCustomersChange} onBack={() => setView('home')} />;
            case 'employees':
                return <EmployeeManager 
                    employees={employees} 
                    onEmployeesChange={onEmployeesChange} 
                    services={services}
                    onBack={() => setView('home')} 
                />;
            case 'assistant':
                return <AssistantManager 
                    isMemoryEnabled={isMemoryEnabled} 
                    onMemoryEnabledChange={onMemoryEnabledChange} 
                    memoryText={memoryText} 
                    onMemoryTextChange={onMemoryTextChange}
                    memoryBoxSettings={memoryBoxSettings}
                    onMemoryBoxSettingsChange={onMemoryBoxSettingsChange}
                    services={services}
                    customers={customers}
                    salonHoursSettings={salonHoursSettings}
                    onBack={() => setView('home')} 
                />;
            case 'salonHours':
                return <SalonHoursManager settings={salonHoursSettings} onSettingsChange={onSalonHoursSettingsChange} onBack={() => setView('home')} />;
            case 'history':
                return <ActionHistoryManager logs={auditLogs} onBack={() => setView('home')} />;
            case 'finance':
                return <FinanceManager 
                    employees={props.employees}
                    appointments={props.appointments}
                    transactions={props.transactions}
                    onTransactionsChange={props.onTransactionsChange}
                    costSettings={props.costSettings}
                    onCostSettingsChange={props.onCostSettingsChange}
                    onBack={() => setView('home')} />;
            case 'pricing':
                return <IndividualServicesPanel
                    services={props.services}
                    onServicesChange={props.onServicesChange}
                    materials={props.materials}
                    serviceRecipes={props.serviceRecipes}
                    onServiceRecipesChange={props.onServiceRecipesChange}
                    combos={props.combos}
                    onCombosChange={props.onCombosChange}
                    costPerMinute={costPerMinute}
                    onBack={() => setView('home')}
                 />;
            case 'inventory':
                 return <MaterialsPanel
                    materials={props.materials}
                    onMaterialsChange={props.onMaterialsChange}
                    onBack={() => setView('home')}
                />;
            case 'subscriptions':
                return <SubscriptionManager 
                    subscriptionPlans={subscriptionPlans}
                    onSubscriptionPlansChange={onSubscriptionPlansChange}
                    services={services}
                    serviceRecipes={serviceRecipes}
                    materials={materials}
                    costPerMinute={costPerMinute}
                    onBack={() => setView('home')}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="absolute inset-0 bg-gray-100/90 backdrop-blur-md z-30 animate-fade-in">
            <aside className={`absolute top-0 left-0 h-full bg-white/70 flex flex-col border-r border-gray-200 shadow-lg transition-all duration-300 z-20 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="p-4 border-b h-20 flex items-center justify-center">
                     {!isSidebarCollapsed ? (
                        <h2 className="text-xl font-semibold tracking-wide text-gray-800">Painel de Controle</h2>
                    ) : (
                        <HomeIcon className="h-8 w-8 text-pink-500" />
                    )}
                </div>
                
                {homeItem && (
                    <div className="flex-shrink-0 py-2 border-b border-gray-200">
                        <div className="relative group">
                            <button
                                onClick={homeItem.onClick}
                                className={`flex items-center gap-4 w-full px-4 py-3 text-left transition-colors duration-200 overflow-hidden ${view === 'home' ? 'bg-pink-100 text-pink-700 font-semibold' : 'text-gray-600 hover:bg-gray-200/50'} ${!isSidebarCollapsed && view === 'home' ? 'border-r-4 border-pink-500' : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                {React.cloneElement(homeItem.icon as React.ReactElement, { className: 'h-6 w-6 flex-shrink-0' })}
                                <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'opacity-100'}`}>{homeItem.title}</span>
                            </button>
                             {isSidebarCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    {homeItem.title}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <nav className="flex-grow overflow-y-auto">
                    <ul className="py-2">
                        {otherNavItems.map(item => (
                            <li key={item.id}>
                                <div className="relative group">
                                    <button
                                        onClick={item.onClick}
                                        className={`flex items-center gap-4 w-full px-4 py-3 text-left transition-colors duration-200 overflow-hidden ${view === item.id ? 'bg-pink-100 text-pink-700 font-semibold' : 'text-gray-600 hover:bg-gray-200/50'} ${!isSidebarCollapsed && view === item.id ? 'border-r-4 border-pink-500' : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}
                                    >
                                        {React.cloneElement(item.icon as React.ReactElement, { className: 'h-6 w-6 flex-shrink-0' })}
                                        <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'opacity-100'}`}>{item.title}</span>
                                    </button>
                                     {isSidebarCollapsed && (
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {item.title}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </nav>
                {isSuperAdmin && (
                    <div className="flex-shrink-0 border-t border-gray-200 p-2">
                         <div className="relative group">
                            <button
                                onClick={() => setView('featureSubscriptions')}
                                className={`flex items-center gap-4 w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg overflow-hidden ${view === 'featureSubscriptions' ? 'bg-pink-100 text-pink-700 font-semibold' : 'text-gray-600 hover:bg-gray-200/50'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                <ShieldCheckIcon className="h-6 w-6" />
                                <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'opacity-100'}`}>Gestão de Planos</span>
                            </button>
                            {isSidebarCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    Gestão de Planos
                                </div>
                            )}
                        </div>
                    </div>
                )}
                 <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    className="absolute top-20 -right-4 z-30 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                    aria-label={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
                >
                    {isSidebarCollapsed ? <ChevronRightIcon className="w-5 h-5 text-gray-600"/> : <ChevronLeftIcon className="w-5 h-5 text-gray-600"/>}
                </button>
            </aside>
            <div className="h-full pl-20 flex flex-col relative">
                <header className="flex-shrink-0 flex justify-between items-center w-full p-4 h-20 border-b bg-white/50">
                    <h3 className="text-2xl font-light tracking-wider text-gray-800">{currentViewTitle}</h3>
                    <button onClick={onClose} className="p-2 rounded-full transition-colors hover:bg-black/10" aria-label="Fechar painel"><CloseIcon /></button>
                </header>
                <main id="dashboard-content" className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {renderContent()}
                </main>
                 {(view === 'visuals' || view === 'home') && hasChanges && (
                    <SaveBar hasChanges={hasChanges} onSave={handleSaveVisuals} onCancel={handleCancelVisuals} />
                )}
            </div>
        </div>
    );
};

export default Dashboard;