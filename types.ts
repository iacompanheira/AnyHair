// types.ts

import { Blob } from '@google/genai';

export interface MemoryBoxItem {
    value: string;
    tips: string[];
}
export type MemoryBoxSettings = Record<string, MemoryBoxItem>;


export interface BackgroundSettings {
    url: string;
    zoom: number;
    position: {
        x: number;
        y: number;
    };
}

export interface OverlaySettings {
    enabled: boolean;
    color: string;
    opacity: number;
}

export interface TitlePartSettings {
    text: string;
    color: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
}

export interface TitleSettings {
    parts: TitlePartSettings[];
}

export interface HeaderSettings {
    backgroundColor: string;
    opacity: number;
    height: number;
}

export interface CTAButtonSettings {
    enabled: boolean;
    buttonText: string;
    fontSize: number;
    buttonColor: string;
    textColor: string;
}

export interface Service {
    id: string;
    name: string;
    price: number;
    duration: number; // in minutes
    useManualPrice: boolean;
    useRounding: boolean;
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    imageUrl: string;
    accessLevel: 'Profissional' | 'Administrador' | 'Super Administrador';
    status: 'Ativo' | 'Inativo';
    specialty?: string;
    displayOrder?: number;
    servicesPerformed?: string[]; // array of service IDs
    commissionRate?: number; // percentage
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    notes: string;
    cpf?: string;
}

// --- Appointment Types ---
export type AppointmentStatus = 'Agendado' | 'Concluído' | 'Cancelado' | 'Não Compareceu';
export type PaymentStatus = 'Pendente' | 'Pago';
export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Outro';

export interface Appointment {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    customerId: string;
    customerName: string;
    phone: string;
    serviceId: string;
    serviceName: string;
    professional: string;
    price: number;
    status: AppointmentStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
}


// --- Salon Hours Types ---
export interface DayHours {
    enabled: boolean;
    opens: string; // HH:mm
    closes: string; // HH:mm
    hasBreak: boolean;
    breakStarts?: string; // HH:mm
    breakEnds?: string; // HH:mm
}

export interface StandardHours {
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
}

export interface ExceptionDate {
    date: string; // YYYY-MM-DD
    type: 'closed' | 'special_hours';
    name: string;
    opens?: string;
    closes?: string;
}

export interface SalonHoursSettings {
    standardHours: StandardHours;
    exceptions: ExceptionDate[];
    general: {
        bookingLeadTime: number; // in hours
        enableReminders: boolean;
        reminderTime: number; // in hours before appointment
    };
}

// --- Audit Log Types ---
export interface AuditLog {
    id: string;
    timestamp: string; // ISO 8601
    user: string; // For now, just a name like 'Admin'
    entity: 'customer' | 'service' | 'salonHours' | 'visuals' | 'assistant' | 'appointment' | 'finance' | 'subscription';
    description: string; // HTML-enabled description
}

// --- Raffle Types ---
export interface RaffleWinner {
    id: string; // customer or employee id
    name: string;
    imageUrl?: string;
    type: 'customer' | 'employee';
    date: string; // ISO string
    prize: string;
}


// --- Web Speech API Types ---
export interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

export interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

export interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
}

// --- Finance Module Types ---

export interface Transaction {
    id: string;
    date: string; // ISO 8601
    description: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    canBeDeleted: boolean; // Transactions from appointments cannot be deleted
}

export interface PersonnelCosts {
    defaultBaseSalary: number;
    socialCharges: number; // percentage
    employees: { id: string, name: string, salaryOverride?: number }[];
    workingDaysInMonth: number;
    workingHoursPerDay: number;
    defaultCommissionRate: number; // percentage
}

export interface OperationalCosts {
    rent: number;
    utilities: number; // water, electricity, internet
    productsEstimate: number;
    cleaningAndMaintenance: number;
}

export interface AdministrativeCosts {
    marketing: number;
    accounting: number;
    software: number;
    proLabore: number;
    depreciation: number;
    other: number;
}

export interface TaxCosts {
    fixedTaxes: number;
    cardFee: number; // percentage
    serviceTax: number; // percentage
}

export interface CostSettings {
    personnel: PersonnelCosts;
    operational: OperationalCosts;
    administrative: AdministrativeCosts;
    taxes: TaxCosts;
}

export interface Material {
    id: string;
    name: string;
    packagePrice: number;
    packageSize: number;
    unit: 'un' | 'kg' | 'g' | 'mg' | 'l' | 'ml';
    currentStock: number;
    minStock: number;
    yield?: number;
}

// A ServiceRecipe is the complete technical sheet for a single service.
export interface ServiceRecipe {
    id: string;
    serviceId: string; // Links to a Service via its ID
    executionTime: number; // minutes
    yields: number; // how many services this recipe makes
    materialsUsed: { materialId: string, quantity: number }[];
    additionalCostsPercent: number; // percentage
    safetyMarginPercent: number; // percentage
    profitMarginPercent: number; // percentage
}

export interface Combo {
    id: string;
    name: string;
    serviceIds: string[];
    finalPrice: number;
    discount: number; // percentage
    originalPrice?: number; // For "De/Por" promotional pricing
    isVisibleInCatalog?: boolean; // For catalog visibility
    useRounding: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  includedServices: {
    serviceId: string;
    quantity: number;
  }[];
  features: string[]; // Dynamically generated on save
  isPopular: boolean;
}

// --- App Subscription & Feature Management ---

export interface AppFeature {
  id: string; // e.g., 'reports', 'commissions', 'raffles'
  name: string;
  description: string;
  type: 'feature' | 'kpi';
}

export interface SubscriptionTier {
  id: string; // e.g., 'basic', 'pro', 'premium'
  name: string;
  price: number;
  enabledFeatures: string[]; // Array of AppFeature ids
}

export interface SubscriptionSettings {
  availableTiers: SubscriptionTier[];
  activeTierId: string;
}