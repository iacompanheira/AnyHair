
// constants/initialData.ts
import type { BackgroundSettings, Service, Customer, Employee, SalonHoursSettings, AuditLog, Appointment, MemoryBoxSettings, Material, ServiceRecipe, Combo, CostSettings, Transaction, PaymentMethod, SubscriptionPlan, AppFeature, SubscriptionSettings, AppointmentStatus, PaymentStatus, DayHours } from '../types';
import { toYYYYMMDD, generateUUID } from '../utils/date';

export const initialBackgrounds: BackgroundSettings[] = [
    { url: 'https://i.imgur.com/rlAiIAm.jpg', zoom: 1, position: { x: 50, y: 50 } },
    { url: 'https://i.imgur.com/Zcffr2q.jpg', zoom: 1, position: { x: 50, y: 50 } },
    { url: 'https://i.imgur.com/oD7VmrP.jpg', zoom: 1, position: { x: 50, y: 50 } }
];

export const initialServices: Service[] = [
    { id: '1', name: 'Corte Feminino', price: 79.90, duration: 60, useManualPrice: false, useRounding: true },
    { id: '2', name: 'Escova Progressiva', price: 349.90, duration: 180, useManualPrice: false, useRounding: true },
    { id: '3', name: 'Coloração Completa', price: 159.90, duration: 120, useManualPrice: false, useRounding: true },
    { id: '4', name: 'Hidratação Profunda', price: 69.90, duration: 45, useManualPrice: false, useRounding: true },
    // FIX: Completed the service object to satisfy the 'Service' type.
    { id: '5', name: 'Manicure e Pedicure', price: 49.90, duration: 75, useManualPrice: false, useRounding: true },
    { id: '6', name: 'Design de Sobrancelha', price: 39.90, duration: 30, useManualPrice: false, useRounding: true },
    { id: '7', name: 'Maquiagem Social', price: 129.90, duration: 90, useManualPrice: false, useRounding: true },
];

// FIX: Add all missing initial data exports
export const initialCustomers: Customer[] = [
    { id: 'cust1', name: 'Ana Silva', phone: '(11) 98765-4321', notes: 'Prefere produtos sem cheiro.', cpf: '123.456.789-00' },
    { id: 'cust2', name: 'Beatriz Costa', phone: '(11) 91234-5678', notes: 'Cliente VIP.', cpf: '987.654.321-00' },
];

export const initialEmployees: Employee[] = [
    { id: 'emp_super_admin', name: 'Admin Geral', email: 'admin@anyhair.com', whatsapp: '(11) 99999-9999', imageUrl: 'https://i.imgur.com/4YUa1T2.jpeg', accessLevel: 'Super Administrador', status: 'Ativo' },
    { id: 'emp_admin_1', name: 'Gerente Bia', email: 'bia@anyhair.com', whatsapp: '(11) 98888-8888', imageUrl: 'https://i.imgur.com/8b4Y3s2.jpeg', accessLevel: 'Administrador', status: 'Ativo' },
    { id: 'emp_prof_1', name: 'Camila Souza', email: 'camila@anyhair.com', whatsapp: '(11) 97777-7777', imageUrl: 'https://i.imgur.com/of14Am4.jpeg', accessLevel: 'Profissional', specialty: 'Cortes e Coloração', status: 'Ativo', servicesPerformed: ['1', '3'] },
    { id: 'emp_prof_2', name: 'Juliana Ribeiro', email: 'juliana@anyhair.com', whatsapp: '(11) 96666-6666', imageUrl: 'https://i.imgur.com/eY1g51F.jpeg', accessLevel: 'Profissional', specialty: 'Estética e Unhas', status: 'Ativo', servicesPerformed: ['5', '6'] },
];

const defaultDay: DayHours = { enabled: true, opens: '09:00', closes: '18:00', hasBreak: true, breakStarts: '12:00', breakEnds: '13:00' };
export const initialSalonHoursSettings: SalonHoursSettings = {
    standardHours: {
        monday: { ...defaultDay, enabled: false, opens: '', closes: '', hasBreak: false },
        tuesday: { ...defaultDay },
        wednesday: { ...defaultDay },
        thursday: { ...defaultDay },
        friday: { ...defaultDay },
        saturday: { ...defaultDay, closes: '17:00' },
        sunday: { ...defaultDay, enabled: false, opens: '', closes: '', hasBreak: false },
    },
    exceptions: [],
    general: { bookingLeadTime: 2, enableReminders: true, reminderTime: 24 }
};

export const initialAuditLogs: AuditLog[] = [
    { id: 'log1', timestamp: new Date().toISOString(), user: 'Admin', entity: 'visuals', description: 'Configurações visuais iniciais aplicadas.' }
];

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
export const initialAppointments: Appointment[] = [
    { id: 'apt1', date: toYYYYMMDD(today), time: '10:00', customerId: 'cust1', customerName: 'Ana Silva', phone: '(11) 98765-4321', serviceId: '1', serviceName: 'Corte Feminino', professional: 'Camila Souza', price: 79.90, status: 'Agendado', paymentStatus: 'Pendente' },
    { id: 'apt2', date: toYYYYMMDD(today), time: '14:00', customerId: 'cust2', customerName: 'Beatriz Costa', phone: '(11) 91234-5678', serviceId: '5', serviceName: 'Manicure e Pedicure', professional: 'Juliana Ribeiro', price: 49.90, status: 'Agendado', paymentStatus: 'Pendente' },
];

export const initialMemoryBoxSettings: MemoryBoxSettings = {
    '011': {
        value: 'Olá, clique no botão para o agendamento',
        tips: []
    }
};

export const initialMaterials: Material[] = [];
export const initialServiceRecipes: ServiceRecipe[] = [];
export const initialCombos: Combo[] = [];
export const initialCostSettings: CostSettings = {
    personnel: { defaultBaseSalary: 2000, socialCharges: 40, employees: [], workingDaysInMonth: 22, workingHoursPerDay: 8, defaultCommissionRate: 10 },
    operational: { rent: 3000, utilities: 800, productsEstimate: 500, cleaningAndMaintenance: 200 },
    administrative: { marketing: 300, accounting: 400, software: 150, proLabore: 4000, depreciation: 100, other: 50 },
    taxes: { fixedTaxes: 200, cardFee: 3.5, serviceTax: 5 },
};
export const initialTransactions: Transaction[] = [];
export const initialSubscriptionPlans: SubscriptionPlan[] = [];
export const initialSubscriptionSettings: SubscriptionSettings = {
    availableTiers: [
        { id: 'basic', name: 'Básico', price: 0, enabledFeatures: ['appointments', 'calendar', 'customers', 'employees', 'services', 'salonHours', 'visuals', 'assistant', 'history'] },
        { id: 'pro', name: 'Profissional', price: 99, enabledFeatures: ['appointments', 'calendar', 'customers', 'employees', 'services', 'salonHours', 'visuals', 'assistant', 'history', 'finance', 'pricing', 'inventory', 'reports', 'commissions'] },
        { id: 'premium', name: 'Premium', price: 149, enabledFeatures: ['appointments', 'calendar', 'customers', 'employees', 'services', 'salonHours', 'visuals', 'assistant', 'history', 'finance', 'pricing', 'inventory', 'reports', 'commissions', 'subscriptions', 'raffles'] },
    ],
    activeTierId: 'premium',
};

export const APP_FEATURES: AppFeature[] = [
    { id: 'home', name: 'Início', description: 'Visão geral do painel.', type: 'feature' },
    { id: 'reports', name: 'Relatórios', description: 'Analise o desempenho e métricas do seu negócio.', type: 'feature' },
    { id: 'appointments', name: 'Agenda do Dia', description: 'Gerencie os agendamentos de um dia específico.', type: 'feature' },
    { id: 'calendar', name: 'Calendário Completo', description: 'Visão panorâmica mensal da agenda do salão.', type: 'feature' },
    { id: 'customers', name: 'Clientes', description: 'Gerencie seus clientes e agendamentos.', type: 'feature' },
    { id: 'employees', name: 'Funcionários', description: 'Gerencie a equipe de profissionais.', type: 'feature' },
    { id: 'finance', name: 'Finanças e Custos', description: 'Visão geral, fluxo de caixa e configuração de custos.', type: 'feature' },
    { id: 'pricing', name: 'Precificação', description: 'Defina preços, receitas e pacotes de serviços.', type: 'feature' },
    { id: 'inventory', name: 'Estoque de Materiais', description: 'Gerencie o inventário de produtos e materiais.', type: 'feature' },
    { id: 'commissions', name: 'Relatório de Comissões', description: 'Analise o faturamento e comissões dos profissionais.', type: 'kpi' },
    { id: 'services', name: 'Catálogo de Serviços', description: 'Visualize os serviços e pacotes oferecidos.', type: 'feature' },
    { id: 'subscriptions', name: 'Planos de Assinatura', description: 'Crie e gerencie planos de assinatura mensais.', type: 'feature' },
    { id: 'raffles', name: 'Sorteios', description: 'Realize sorteios para clientes e funcionários.', type: 'feature' },
    { id: 'salonHours', name: 'Horário do Salão', description: 'Defina o horário de funcionamento e feriados.', type: 'feature' },
    { id: 'visuals', name: 'Visual', description: 'Personalize a aparência da tela inicial.', type: 'feature' },
    { id: 'assistant', name: 'Assistente IA', description: 'Defina a persona e interaja com a IA.', type: 'feature' },
    { id: 'history', name: 'Histórico de Ações', description: 'Audite e monitore as atividades.', type: 'feature' },
];
