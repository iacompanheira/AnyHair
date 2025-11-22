export const getProjectCodeContext = (): string => {
    return `
--- START OF FILE index.tsx ---
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
--- END OF FILE index.tsx ---

--- START OF FILE metadata.json ---
{
  "name": "✴️Tentativa 13✴️🔵 - ✴️ 06/11/25 ✴️ 21:21 horas",
  "description": "Usando o 🔵✴️Base✴️🔵 - ( 93A ) - ✴️ 02/11/25 ✴️ 20:40 horas",
  "requestFramePermissions": [
    "microphone",
    "camera"
  ]
}
--- END OF FILE metadata.json ---

--- START OF FILE index.html ---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AnyHair</title>
  <script src="https://cdn.tailwindcss.com"></script>
<script type="importmap">
{
  "imports": {
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.26.0",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/"
  }
}
</script>
<style>
  html, body, #root {
    height: 100%;
    margin: 0;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  .transition-enter-fade { animation: fadeIn forwards; }
  .transition-leave-fade { animation: fadeOut forwards; }

  @keyframes slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes slideOutUp { from { transform: translateY(0); } to { transform: translateY(-100%); } }
  .transition-enter-slide-up { animation: slideInUp forwards; }
  .transition-leave-slide-up { animation: slideOutUp forwards; }
  
  @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
  .transition-enter-slide-right { animation: slideInRight forwards; }
  .transition-leave-slide-right { animation: slideOutRight forwards; }

  @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes zoomOut { from { transform: scale(1); opacity: 1; } to { transform: scale(1.2); opacity: 0; } }
  .transition-enter-zoom-in { animation: zoomIn forwards; }
  .transition-leave-zoom-in { animation: zoomOut forwards; }

  @keyframes zoomInSlight { from { transform: scale(1.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes zoomOutSlight { from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; } }
  .transition-enter-zoom-out { animation: zoomInSlight forwards; }
  .transition-leave-zoom-out { animation: zoomOutSlight forwards; }
  
  @keyframes blurIn { from { filter: blur(20px); opacity: 0; } to { filter: blur(0); opacity: 1; } }
  @keyframes blurOut { from { filter: blur(0); opacity: 1; } to { filter: blur(20px); opacity: 0; } }
  .transition-enter-blur { animation: blurIn forwards; }
  .transition-leave-blur { animation: blurOut forwards; }
  
  @keyframes wipeInRight { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
  @keyframes wipeOutLeft { from { clip-path: inset(0 0 0 0); } to { clip-path: inset(0 0 0 100%); } }
  .transition-enter-wipe-right { animation: wipeInRight forwards; }
  .transition-leave-wipe-right { animation: wipeOutLeft forwards; z-index: 3 !important; }

  @keyframes circleIn { from { clip-path: circle(0%); } to { clip-path: circle(150%); } }
  @keyframes circleOut { from { opacity: 1; } to { opacity: 1; } }
  .transition-enter-circle-wipe { animation: circleIn forwards; z-index: 3 !important; }
  .transition-leave-circle-wipe { animation: circleOut forwards; }

  @keyframes revealInY { from { clip-path: inset(50% 0 50% 0); } to { clip-path: inset(0 0 0 0); } }
  @keyframes revealOutY { from { opacity: 1; } to { opacity: 1; } }
  .transition-enter-reveal-y { animation: revealInY forwards; z-index: 3 !important; }
  .transition-leave-reveal-y { animation: revealOutY forwards; }
  
  @keyframes rotateIn { from { transform: scale(0.5) rotate(-180deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
  @keyframes rotateOut { from { transform: scale(1); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }
  .transition-enter-rotate-in { animation: rotateIn forwards; }
  .transition-leave-rotate-in { animation: rotateOut forwards; }

  @keyframes fadeInSlight { from { opacity: 0; } to { opacity: 1; } }
  .animate-fade-in { animation: fadeInSlight 0.5s ease-out forwards; }

  @keyframes pulse-red {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
  }
  .animate-pulse-red { animation: pulse-red 2s infinite; }

  @keyframes pulse-blue {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
  }
  .animate-pulse-blue { animation: pulse-blue 2s infinite; }

  @keyframes button-glow {
    0%, 100% {
      filter: brightness(1) drop-shadow(0px 0px 0px transparent);
      transform: scale(1);
    }
    50% {
      filter: brightness(1.3) drop-shadow(0px 0px 15px #EC4899);
      transform: scale(1.05);
    }
  }
  .animate-glow-once {
    animation: button-glow 2s ease-in-out;
  }
  .animate-glow-perpetual {
    animation: button-glow 2.5s ease-in-out infinite;
  }
  
  @keyframes confetti-fall {
    0% { transform: translateY(-100vh) rotateZ(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; }
  }
  .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      animation: confetti-fall 4s linear forwards;
  }

  @media print {
    body, #root {
      background-color: white !important;
      color: black !important;
    }
    .print-hidden {
      display: none !important;
    }
    .print-container {
      position: static;
      height: auto;
      overflow: visible;
    }
    .calendar-grid-container {
      overflow: visible !important;
    }
  }
</style>
</head>
<body class="bg-[#0D1117] text-[#E2E8F0]">
  <div id="root"></div>
  <script type="module" src="/index.tsx"></script>
</body>
</html>
--- END OF FILE index.html ---

--- START OF FILE types.ts ---
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
--- END OF FILE types.ts ---

--- START OF FILE utils/audio.ts ---
import { Blob } from '@google/genai';

// Encodes raw audio Uint8Array to a base64 string
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Decodes a base64 string to a Uint8Array
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM audio data into an AudioBuffer for playback
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Creates a Gemini Blob object from microphone audio data
export function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}
--- END OF FILE utils/audio.ts ---

--- START OF FILE App.tsx ---
// App.tsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type, Chat, FunctionCall } from '@google/genai';
import { createBlob, decode, decodeAudioData } from './utils/audio';
import { playClickSound } from './utils/sfx';
import { formatServicesForPrompt, formatEmployeesForPrompt } from './utils/promptFormatters';
import { highlightElement, clickElement, scrollElement, typeText } from './utils/uiController';
import Dashboard from './Dashboard';
import type { BackgroundSettings, OverlaySettings, TitleSettings, HeaderSettings, CTAButtonSettings, Service, Customer, Employee, SalonHoursSettings, AuditLog, Appointment, MemoryBoxSettings, Material, ServiceRecipe, Combo, CostSettings, Transaction, SubscriptionPlan, SubscriptionSettings } from './types';
import { calculateServiceCostBreakdown } from './utils/pricing';
import { applyCustomRounding } from './utils/rounding';

import usePrevious from './hooks/usePrevious';
import { initialBackgrounds, initialServices, initialCustomers, initialEmployees, initialSalonHoursSettings, initialAuditLogs, initialAppointments, initialMemoryBoxSettings, initialMaterials, initialServiceRecipes, initialCombos, initialCostSettings, initialTransactions, initialSubscriptionPlans, initialSubscriptionSettings } from './constants/initialData';
import { DEFAULT_MEMORY_TEXT } from './constants/prompts';
import { INPUT_SAMPLE_RATE, OUTPUT_SAMPLE_RATE, MIC_BUFFER_SIZE, DEFAULT_ROTATION_INTERVAL_MS, DEFAULT_TRANSITION_DURATION_MS } from './constants/appConfig';

import Header from './components/Header';
import CTAButton from './components/CTAButton';
import WaveformVisualizer from './components/WaveformVisualizer';
import StatusText from './components/StatusText';
import CameraView from './components/CameraView';
import BottomInputBar from './components/BottomInputBar';
import StopButton from './components/StopButton';
import AuthForm from './components/AuthForm';
import AppointmentConfirmationCard from './components/AppointmentConfirmationCard';
import FloatingActionButtons from './components/FloatingActionButtons';
import AppointmentManager from './components/dashboard/AppointmentManager';
import ServiceManager from './components/dashboard/ServiceManager';
import EmployeeManager from './components/dashboard/EmployeeManager';
import SalonHoursManager from './components/dashboard/SalonHoursManager';
import SubscriptionView from './components/SubscriptionView';
import ContactView from './components/ContactView';
import GalleryView from './components/GalleryView';
import StaffAccessModal from './components/StaffAccessModal';
import ManualScheduleButton from './components/ManualScheduleButton';
import ManualScheduling from './components/ManualScheduling';
import { generateUUID } from './utils/date';

type Status = 'idle' | 'connecting' | 'listening' | 'error';
type AppState = 'welcome' | 'chat';
type AuthFormMode = 'login' | 'register';

const initialCardOrder: string[] = [
    'appointments', 'calendar', 'customers', 'employees', 'services', 'subscriptions', 
    'raffles', 'reports', 'commissions', 'salonHours', 'visuals', 'assistant', 
    'finance', 'pricing', 'inventory', 'history'
];


const App: React.FC = () => {
    const [status, setStatus] = useState<Status>('idle');
    const [appState, setAppState] = useState<AppState>('welcome');
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isDashboardOpen, setDashboardOpen] = useState(false);
    const [isStaffAccessOpen, setIsStaffAccessOpen] = useState(false);
    const [isManualSchedulingOpen, setIsManualSchedulingOpen] = useState(false);
    const [isCameraOpen, setCameraOpen] = useState(false);
    const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
    const [isLoadingResponse, setLoadingResponse] = useState(false);
    const [isAuthFormVisible, setIsAuthFormVisible] = useState(false);
    const [authFormMode, setAuthFormMode] = useState<AuthFormMode>('register');
    const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
    const [isCtaButtonEnabled, setIsCtaButtonEnabled] = useState(true);
    const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
    const [clientView, setClientView] = useState<string | null>(null);
    
    // Settings & Data
    const [backgrounds, setBackgrounds] = useState<BackgroundSettings[]>(initialBackgrounds);
    const [services, setServices] = useState<Service[]>(initialServices);
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [materials, setMaterials] = useState<Material[]>(initialMaterials);
    const [serviceRecipes, setServiceRecipes] = useState<ServiceRecipe[]>(initialServiceRecipes);
    const [combos, setCombos] = useState<Combo[]>(initialCombos);
    const [costSettings, setCostSettings] = useState<CostSettings>(initialCostSettings);
    const [salonHoursSettings, setSalonHoursSettings] = useState<SalonHoursSettings>(initialSalonHoursSettings);
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(initialSubscriptionPlans);
    const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>(initialSubscriptionSettings);
    const [isRotationEnabled, setRotationEnabled] = useState(true);
    const [rotationInterval, setRotationInterval] = useState(DEFAULT_ROTATION_INTERVAL_MS);
    const [transitionDuration, setTransitionDuration] = useState(DEFAULT_TRANSITION_DURATION_MS);
    const [transitionStyle, setTransitionStyle] = useState('fade');
    const [visualizerStyle, setVisualizerStyle] = useState(0); // Restored visualizer style state
    const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>({ enabled: false, color: '#0D1117', opacity: 0.5 });
    const [titleSettings, setTitleSettings] = useState<TitleSettings>({
        parts: [
            { text: 'Any', color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', fontStyle: 'normal' },
            { text: 'Hair', color: '#EC4899', fontSize: 26, fontWeight: 'bold', fontStyle: 'normal' },
        ]
    });
     const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
        backgroundColor: '#FFFFFF',
        opacity: 0.1,
        height: 44,
    });
    const [micGain, setMicGain] = useState(1);
    const [isNoiseReductionEnabled, setNoiseReductionEnabled] = useState(false);
    const [ctaSettings, setCtaSettings] = useState<CTAButtonSettings>({
        enabled: true,
        buttonText: 'Agendar seu horário',
        fontSize: 22,
        buttonColor: '#EC4899',
        textColor: '#FFFFFF',
    });
    const [isMemoryEnabled, setMemoryEnabled] = useState(true);
    const [memoryText, setMemoryText] = useState(DEFAULT_MEMORY_TEXT);
    const [memoryBoxSettings, setMemoryBoxSettings] = useState<MemoryBoxSettings>(initialMemoryBoxSettings);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
    const [cardOrder, setCardOrder] = useState<string[]>(initialCardOrder);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    // Background transition state
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const previousBgIndex = usePrevious(currentBgIndex);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const isTransitioningRef = useRef(isTransitioning);
    useEffect(() => {
        isTransitioningRef.current = isTransitioning;
    }, [isTransitioning]);


    // Audio and API refs
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const chatSessionRef = useRef<Chat | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const welcomeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const conversationInitiatedRef = useRef(false);
    const micStreamRef = useRef<MediaStream | null>(null);
    const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);

    const isCallActive = status !== 'idle';

    // --- LOGGING ---
    const currentUser = 'Admin'; 

    const addLog = useCallback((entity: AuditLog['entity'], description: string) => {
        const newLog: AuditLog = {
            id: generateUUID(),
            timestamp: new Date().toISOString(),
            user: currentUser,
            entity,
            description,
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, []);

    // --- WRAPPED STATE HANDLERS FOR LOGGING ---
    const handleServicesChange = useCallback((newServices: Service[]) => {
        if (newServices.length > services.length) {
            const added = newServices.find(ns => !services.some(os => os.id === ns.id));
            if (added) addLog('service', \`Serviço <strong>\${added.name}</strong> adicionado.\`);
        } else if (newServices.length < services.length) {
            const removed = services.find(os => !newServices.some(ns => ns.id === os.id));
             if (removed) addLog('service', \`Serviço <strong>\${removed.name}</strong> removido.\`);
        } else {
            addLog('service', 'Lista de serviços foi atualizada.');
        }
        setServices(newServices);
    }, [services, addLog]);
    
    const handleMaterialsChange = useCallback((newMaterials: Material[]) => {
        addLog('finance', 'Estoque de materiais foi atualizado.');
        setMaterials(newMaterials);
    }, [addLog]);

    const handleServiceRecipesChange = useCallback((newRecipes: ServiceRecipe[]) => {
        addLog('finance', 'Receitas de precificação de serviços foram atualizadas.');
        setServiceRecipes(newRecipes);
    }, [addLog]);

    const handleCombosChange = useCallback((newCombos: Combo[]) => {
        addLog('finance', 'Pacotes e combos foram atualizados.');
        setCombos(newCombos);
    }, [addLog]);

    const handleCostSettingsChange = useCallback((newCostSettings: CostSettings) => {
        addLog('finance', 'As configurações de custos do salão foram atualizadas.');
        setCostSettings(newCostSettings);
    }, [addLog]);
    
    const handleTransactionsChange = useCallback((newTransactions: Transaction[]) => {
        addLog('finance', 'Lista de transações financeiras foi atualizada.');
        setTransactions(newTransactions);
    }, [addLog]);

    const handleSubscriptionPlansChange = useCallback((newPlans: SubscriptionPlan[]) => {
        addLog('subscription', 'Os planos de assinatura foram atualizados.');
        setSubscriptionPlans(newPlans);
    }, [addLog]);

    const handleSubscriptionSettingsChange = useCallback((newSettings: SubscriptionSettings) => {
        addLog('subscription', 'As configurações de planos e recursos do app foram atualizadas.');
        setSubscriptionSettings(newSettings);
    }, [addLog]);

    const handleEmployeesChange = useCallback((newEmployees: Employee[]) => {
        addLog('assistant', 'A lista de funcionários foi atualizada.');
        setEmployees(newEmployees);
    }, [addLog]);
    
    const handleCustomersChange = useCallback((newCustomers: Customer[]) => {
        if (newCustomers.length > customers.length) {
            const added = newCustomers.find(nc => !customers.some(oc => oc.id === nc.id));
            if(added) addLog('customer', \`Cliente <strong>\${added.name}</strong> foi adicionado.\`);
        } else if (newCustomers.length < customers.length) {
            const removed = customers.find(oc => !newCustomers.some(nc => nc.id === oc.id));
            if(removed) addLog('customer', \`Cliente <strong>\${removed.name}</strong> foi removido.\`);
        } else {
             addLog('customer', 'Lista de clientes foi atualizada.');
        }
        setCustomers(newCustomers);
    }, [customers, addLog]);

    const handleSalonHoursChange = useCallback((newSettings: SalonHoursSettings) => {
        addLog('salonHours', 'Configurações de horário do salão foram atualizadas.');
        setSalonHoursSettings(newSettings);
    }, [addLog]);
    
    const handleAppointmentsChange = useCallback((newAppointments: Appointment[]) => {
        addLog('appointment', 'Lista de agendamentos foi atualizada.');
        setAppointments(newAppointments);
    }, [addLog]);

     const handleMemoryEnabledChange = useCallback((enabled: boolean) => {
        addLog('assistant', \`Memória da assistente foi <strong>\${enabled ? 'ativada' : 'desativada'}</strong>.\`);
        setMemoryEnabled(enabled);
    }, [addLog]);

    const handleMemoryTextChange = useCallback((text: string) => {
        addLog('assistant', 'Texto da memória da assistente foi atualizado.');
        setMemoryText(text);
    }, [addLog]);
    
    const handleMemoryBoxSettingsChange = useCallback((newSettings: MemoryBoxSettings) => {
        addLog('assistant', 'Caixa de memórias da assistente foi atualizada.');
        setMemoryBoxSettings(newSettings);
    }, [addLog]);

    const handleCardOrderChange = useCallback((newOrder: string[]) => {
        setCardOrder(newOrder);
        addLog('visuals', 'A ordem dos cards do dashboard foi atualizada.');
    }, [addLog]);
    
    const handleConfirmManualAppointment = useCallback((newAppointmentData: Omit<Appointment, 'id'>) => {
        const newAppointment: Appointment = {
            ...newAppointmentData,
            id: generateUUID(),
        };
        setAppointments(prev => [...prev, newAppointment]);
        addLog('appointment', \`Agendamento para <strong>\${newAppointment.customerName}</strong> (\${newAppointment.serviceName}) criado manualmente.\`);
        setConfirmedAppointment(newAppointment);
        setIsManualSchedulingOpen(false);
    }, [addLog]);

    // --- PRICE CALCULATION LOGIC ---
    const costPerMinute = useMemo(() => {
        const { personnel, operational, administrative, taxes } = costSettings;
        
        const personnelWithSalaries = employees.map(emp => {
            const override = personnel.employees.find(e => e.id === emp.id)?.salaryOverride;
            return { ...emp, salaryOverride: override };
        });

        const totalSalary = personnelWithSalaries.reduce((sum, emp) => {
            const salary = emp.salaryOverride ?? personnel.defaultBaseSalary;
            return sum + salary;
        }, 0);
        
        const personnelCost = totalSalary * (1 + personnel.socialCharges / 100);
        const operationalCost = Object.values(operational).reduce<number>((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        const administrativeCost = Object.values(administrative).reduce<number>((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        const fixedTaxes = taxes.fixedTaxes;
        
        const totalMonthlyCost = personnelCost + operationalCost + administrativeCost + fixedTaxes;
        
        const numberOfActiveProfessionals = employees.filter(e => e.accessLevel === 'Profissional' && e.status === 'Ativo').length;
        const totalProductiveHours = personnel.workingDaysInMonth * personnel.workingHoursPerDay * (numberOfActiveProfessionals || 1);

        if (totalProductiveHours === 0) return 0;
        const costPerHour = totalMonthlyCost / totalProductiveHours;
        return costPerHour / 60;
    }, [costSettings, employees]);

    // This effect automatically syncs service prices when costs, recipes, or settings change.
    useEffect(() => {
        const materialsMap: Map<string, Material> = new Map(materials.map(m => [m.id, m]));
        let pricesChanged = false;

        const updatedServices = services.map(service => {
            if (service.useManualPrice) {
                return service; // Skip manual priced services
            }

            const recipe = serviceRecipes.find(r => r.serviceId === service.id);
            if (!recipe) {
                return service; // No recipe, no change
            }
            
            const { totalCost } = calculateServiceCostBreakdown(recipe, materialsMap, costPerMinute);
            const profitMargin = Math.max(0, Math.min(0.99, recipe.profitMarginPercent / 100));
            const baseSalePrice = profitMargin < 1 ? totalCost / (1 - profitMargin) : totalCost;
            
            const finalPrice = service.useRounding ? applyCustomRounding(baseSalePrice) : baseSalePrice;
            
            if (Math.abs(service.price - finalPrice) > 0.01) {
                pricesChanged = true;
                return { ...service, price: finalPrice };
            }

            return service;
        });

        if (pricesChanged) {
            setServices(updatedServices);
        }
    }, [services, serviceRecipes, materials, costPerMinute]);
    
    // Preload images to prevent flashing on transition
    useEffect(() => {
        backgrounds.forEach(bg => {
            const img = new Image();
            img.src = bg.url;
        });
    }, [backgrounds]);

    // Update mic gain live if a session is active
    useEffect(() => {
        if (gainNodeRef.current && inputAudioContextRef.current) {
            gainNodeRef.current.gain.setValueAtTime(micGain, inputAudioContextRef.current.currentTime);
        }
    }, [micGain]);

    // --- Centralized Audio Context Management ---
    const getOutputAudioContext = useCallback(async (): Promise<AudioContext> => {
        if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            outputAudioContextRef.current = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
        }
        if (outputAudioContextRef.current.state === 'suspended') {
            await outputAudioContextRef.current.resume();
        }
        return outputAudioContextRef.current;
    }, []);

    const playAudioFromBase64 = useCallback(async (base64Audio: string, onEnded?: () => void) => {
        try {
            const outputCtx = await getOutputAudioContext();
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, OUTPUT_SAMPLE_RATE, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);
            if (onEnded) source.onended = onEnded;
            source.start();
            return source;
        } catch (error) {
            console.error("Failed to play audio from base64:", error);
            if (onEnded) onEnded();
            return null;
        }
    }, [getOutputAudioContext]);

    // Play welcome message once on load
    useEffect(() => {
        const playWelcomeMessage = async () => {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-preview-tts',
                    contents: [{ parts: [{ text: "Olá, clique no botão para agendar!" }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    },
                });
                
                if (conversationInitiatedRef.current) return;

                const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    const source = await playAudioFromBase64(base64Audio);
                    if (source) {
                        welcomeAudioSourceRef.current = source;
                         source.addEventListener('ended', () => {
                            if (welcomeAudioSourceRef.current === source) {
                                welcomeAudioSourceRef.current = null;
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to play welcome message:", error);
            }
        };

        if (!hasPlayedWelcome) {
            playWelcomeMessage();
            setHasPlayedWelcome(true);
        }
    }, [hasPlayedWelcome, playAudioFromBase64, ai]);
    
    // Play TTS message when a confirmation card is shown
    useEffect(() => {
        if (confirmedAppointment) {
            const playConfirmationMessage = async () => {
                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-preview-tts',
                        contents: [{ parts: [{ text: "Você pode salvar no celular, clicando em compartilhar" }] }],
                        config: {
                            responseModalities: [Modality.AUDIO],
                            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                        },
                    });

                    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        await playAudioFromBase64(base64Audio);
                    }
                } catch (error) {
                    console.error("Failed to play confirmation message:", error);
                }
            };
            playConfirmationMessage();
        }
    }, [confirmedAppointment, playAudioFromBase64, ai]);

    const advanceBackground = useCallback(() => {
        if (isTransitioningRef.current || backgrounds.length < 2) return;
        
        setIsTransitioning(true);
        setCurrentBgIndex(prev => (prev + 1) % backgrounds.length);
        
        setTimeout(() => setIsTransitioning(false), transitionDuration + 50);

    }, [backgrounds.length, transitionDuration]);

    useEffect(() => {
        if (isRotationEnabled && backgrounds.length > 1) {
            const timer = setInterval(advanceBackground, rotationInterval);
            return () => clearInterval(timer);
        }
    }, [isRotationEnabled, rotationInterval, backgrounds.length, advanceBackground]);

    const handleStopListening = useCallback(() => {
        if (!micStreamRef.current) return;
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;

        scriptProcessorRef.current?.disconnect();
        micSourceRef.current?.disconnect();
        gainNodeRef.current?.disconnect();
        compressorNodeRef.current?.disconnect();
        
        if (inputAudioContextRef.current?.state !== 'closed') inputAudioContextRef.current?.close();
        if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close();
        
        for (const source of audioSourcesRef.current.values()) {
            source.disconnect();
        }
        audioSourcesRef.current.clear();

        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        chatSessionRef.current = null;
        
        setStatus('idle');
        setAppState('welcome');
        setIsAiSpeaking(false);
        conversationInitiatedRef.current = false; // Reset for next session
    }, []);

    const functionDeclarations = useMemo<FunctionDeclaration[]>(() => [
        {
            name: 'showRegisterForm',
            parameters: { type: Type.OBJECT, properties: {} },
            description: 'Mostra o formulário de cadastro para o cliente. ESSA FUNÇÃO DEVE SER CHAMADA para exibir ou mudar para a tela de cadastro.'
        },
        {
            name: 'showLoginForm',
            parameters: { type: Type.OBJECT, properties: {} },
            description: 'Mostra o formulário de login para o cliente. ESSA FUNÇÃO DEVE SER CHAMADA para exibir ou mudar para a tela de login.'
        },
        {
            name: 'scheduleAppointment',
            description: 'Agenda um horário para um cliente após todos os detalhes (serviço, data, horário, nome) serem confirmados.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    customerName: { type: Type.STRING, description: 'O nome completo do cliente.' },
                    serviceName: { type: Type.STRING, description: 'O nome exato do serviço a ser agendado.' },
                    date: { type: Type.STRING, description: 'A data do agendamento no formato AAAA-MM-DD.' },
                    time: { type: Type.STRING, description: 'A hora do agendamento no formato HH:MM.' },
                },
                required: ['customerName', 'serviceName', 'date', 'time'],
            },
        },
        {
            name: 'highlightElement',
            description: 'Aplica um brilho temporário a um elemento da UI para chamar a atenção do usuário.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    elementId: { type: Type.STRING, description: 'O ID do elemento HTML a ser destacado.' },
                    duration: { type: Type.NUMBER, description: 'Duração do brilho em milissegundos (opcional).' }
                },
                required: ['elementId']
            }
        },
        {
            name: 'clickElement',
            description: 'Simula um clique de mouse em um elemento da UI, como um botão.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    elementId: { type: Type.STRING, description: 'O ID do elemento HTML a ser clicado.' },
                },
                required: ['elementId']
            }
        },
        {
            name: 'scrollElement',
            description: 'Rola uma área de conteúdo da página para cima, para baixo, para o topo ou para o fim.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    elementId: { type: Type.STRING, description: "O ID do elemento a ser rolado. Use 'window' para a página inteira." },
                    direction: { type: Type.STRING, description: "'up', 'down', 'top', ou 'bottom'." },
                    amount: { type: Type.NUMBER, description: "Quantidade em pixels para rolar (para 'up' e 'down', opcional)." }
                },
                required: ['elementId', 'direction']
            }
        },
        {
            name: 'typeText',
            description: 'Digita um texto em um campo de formulário (input ou textarea).',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    elementId: { type: Type.STRING, description: 'O ID do campo de formulário.' },
                    text: { type: Type.STRING, description: 'O texto a ser inserido.' }
                },
                required: ['elementId', 'text']
            }
        },
        {
            name: 'openManualSchedulingPanel',
            parameters: { type: Type.OBJECT, properties: {} },
            description: 'Abre o painel de agendamento manual para que o usuário ou a IA possam selecionar serviços e horários em uma lista.'
        },
    ], []);
    
    const executeFunctionCall = useCallback(async (fc: FunctionCall): Promise<string> => {
        let result = "Função não encontrada ou falhou.";
        if (fc.name === 'openManualSchedulingPanel') {
            setIsManualSchedulingOpen(true);
            result = "Painel de agendamento manual aberto com sucesso.";
        } else if (fc.name === 'showRegisterForm') {
            setAuthFormMode('register');
            setIsAuthFormVisible(true);
            result = "Formulário de registro exibido.";
        } else if (fc.name === 'showLoginForm') {
            setAuthFormMode('login');
            setIsAuthFormVisible(true);
            result = "Formulário de login exibido.";
        } else if (fc.name === 'scheduleAppointment') {
            const { customerName, serviceName, date, time } = fc.args;
            const service = services.find(s => s.name.toLowerCase() === serviceName.toLowerCase());
            const customer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());

            if (service) {
                const newAppointment: Appointment = {
                    id: generateUUID(), date, time,
                    customerId: customer?.id || 'new',
                    customerName,
                    phone: customer?.phone || 'Não informado',
                    serviceId: service.id,
                    serviceName: service.name,
                    professional: 'Profissional 1', // Placeholder
                    price: service.price,
                    status: 'Agendado',
                    paymentStatus: 'Pendente',
                };
                setAppointments(prev => [...prev, newAppointment]);
                setConfirmedAppointment(newAppointment);
                addLog('appointment', \`Agendamento para <strong>\${customerName}</strong> (\${serviceName}) criado pela IA.\`);
                if (isCallActive) {
                    handleStopListening(); // End voice call to show confirmation
                }
                result = \`Agendamento para \${customerName} criado com sucesso.\`;
            } else {
                result = \`Serviço "\${serviceName}" não encontrado.\`;
            }
        } else if (fc.name === 'highlightElement') {
            const { elementId, duration } = fc.args;
            result = await highlightElement(elementId, duration);
        } else if (fc.name === 'clickElement') {
            const { elementId } = fc.args;
            result = clickElement(elementId);
        } else if (fc.name === 'scrollElement') {
            const { elementId, direction, amount } = fc.args;
            result = scrollElement(elementId, direction, amount);
        } else if (fc.name === 'typeText') {
            const { elementId, text } = fc.args;
            result = typeText(elementId, text);
        }
        return result;
    }, [services, customers, addLog, handleStopListening, isCallActive]);

    
    const handleStartListening = useCallback(async () => {
        setStatus('connecting');
        try {
            const InputAudioContext = window.AudioContext || (window as any).webkitAudioContext;
            inputAudioContextRef.current = new InputAudioContext({ sampleRate: INPUT_SAMPLE_RATE });
            const outputCtx = await getOutputAudioContext();

            nextStartTimeRef.current = 0;
            audioSourcesRef.current.clear();

            gainNodeRef.current = inputAudioContextRef.current.createGain();
            gainNodeRef.current.gain.value = micGain;

            if (isNoiseReductionEnabled) {
                compressorNodeRef.current = inputAudioContextRef.current.createDynamicsCompressor();
                compressorNodeRef.current.threshold.setValueAtTime(-50, inputAudioContextRef.current.currentTime);
                compressorNodeRef.current.knee.setValueAtTime(40, inputAudioContextRef.current.currentTime);
                compressorNodeRef.current.ratio.setValueAtTime(12, inputAudioContextRef.current.currentTime);
                compressorNodeRef.current.attack.setValueAtTime(0, inputAudioContextRef.current.currentTime);
                compressorNodeRef.current.release.setValueAtTime(0.25, inputAudioContextRef.current.currentTime);
            } else {
                compressorNodeRef.current = null;
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;

            let dynamicSystemInstruction = isMemoryEnabled ? memoryText : '';
            if (isMemoryEnabled) {
                 const contextData = [
                    formatServicesForPrompt(services),
                    formatEmployeesForPrompt(employees),
                ].join('\n\n---\n\n');
                dynamicSystemInstruction += \`\n\n--- DADOS ATUALIZADOS DO SISTEMA ---\n\${contextData}\`;
            }

            const connectConfig = { 
                responseModalities: [Modality.AUDIO],
                tools: [{ functionDeclarations }],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                },
                ...(isMemoryEnabled && dynamicSystemInstruction.trim() && { systemInstruction: dynamicSystemInstruction })
            };

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: connectConfig,
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        micSourceRef.current = source;
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(MIC_BUFFER_SIZE, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        let lastNode: AudioNode = source.connect(gainNodeRef.current!);
                        if (compressorNodeRef.current) {
                            lastNode = lastNode.connect(compressorNodeRef.current);
                        }
                        lastNode.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.toolCall) {
                            for (const fc of message.toolCall.functionCalls) {
                                executeFunctionCall(fc).then(result => {
                                    sessionPromiseRef.current?.then((session) => {
                                        session.sendToolResponse({
                                            functionResponses: {
                                                id : fc.id,
                                                name: fc.name,
                                                response: { result: result },
                                            }
                                        })
                                    });
                                });
                            }
                        }

                         if (message.serverContent?.interrupted) {
                            for (const source of audioSourcesRef.current.values()) {
                                source.stop();
                            }
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setIsAiSpeaking(false);
                            return;
                         }
                        
                         const audioDataB64 = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                         if (audioDataB64) {
                            if (!isAiSpeaking) setIsAiSpeaking(true);
                            if (outputCtx.state === 'closed') return;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const decodedData = decode(audioDataB64);
                            const audioBuffer = await decodeAudioData(decodedData, outputCtx, OUTPUT_SAMPLE_RATE, 1);
                            if (outputCtx.state === 'closed') return;
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                                if (audioSourcesRef.current.size === 0) setIsAiSpeaking(false);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                         }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('API Error:', e);
                        setStatus('error');
                        handleStopListening();
                    },
                    onclose: () => {},
                },
            });

        } catch (err) {
            console.error("Failed to start listening:", err);
            if (String(err).includes('Permission denied')) {
                alert("A permissão do microfone foi negada. Por favor, habilite-a nas configurações do seu navegador para usar o assistente de voz.");
            }
            setStatus('error');
            handleStopListening();
        }
    }, [handleStopListening, micGain, isNoiseReductionEnabled, isMemoryEnabled, memoryText, services, employees, getOutputAudioContext, functionDeclarations, executeFunctionCall, ai]);
    
     const initializeChatSession = useCallback(async () => {
        if (chatSessionRef.current) return;
        
        let dynamicSystemInstruction = isMemoryEnabled ? memoryText : '';
        if (isMemoryEnabled) {
            const contextData = [
                formatServicesForPrompt(services),
                formatEmployeesForPrompt(employees),
            ].join('\n\n---\n\n');
            dynamicSystemInstruction += \`\n\n--- DADOS ATUALIZADOS DO SISTEMA ---\n\${contextData}\`;
        }
        
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                ...(dynamicSystemInstruction.trim() && { systemInstruction: dynamicSystemInstruction }),
                tools: [{ functionDeclarations }],
            },
        });
        chatSessionRef.current = chat;
    }, [isMemoryEnabled, memoryText, services, employees, functionDeclarations, ai]);

    const handleSendText = async (text: string) => {
        setLoadingResponse(true);
        setGeminiResponse(null);
        try {
            if (!chatSessionRef.current) {
                await initializeChatSession();
            }
            
            const chat = chatSessionRef.current!;
            let response = await chat.sendMessage({ message: text });

            if (response.functionCalls && response.functionCalls.length > 0) {
                const functionResponses = [];
                for (const fc of response.functionCalls) {
                    const result = await executeFunctionCall(fc);
                    functionResponses.push({
                        functionResponse: {
                            name: fc.name,
                            id: fc.id,
                            response: { result },
                        },
                    });
                }
                response = await chat.sendMessage({ parts: functionResponses });
            }

            setGeminiResponse(response.text);

        } catch (error) {
            console.error("Error sending text to Gemini:", error);
            setGeminiResponse("Desculpe, ocorreu um erro ao processar sua solicitação.");
        } finally {
            setLoadingResponse(false);
        }
    };
    
    const handleSendTextFromBar = (text: string) => {
        if (status !== 'idle') {
            handleStopListening();
        }
        setAppState('chat');
        handleSendText(text);
    };

    const handleStartConversation = () => {
        if (conversationInitiatedRef.current) return;
        conversationInitiatedRef.current = true;

        if (welcomeAudioSourceRef.current) {
            welcomeAudioSourceRef.current.onended = null;
            welcomeAudioSourceRef.current.stop();
            welcomeAudioSourceRef.current = null;
        }

        playClickSound();
        setAppState('chat');
        handleStartListening();
    };

    const handleStop = () => {
        playClickSound();
        handleStopListening();
    };

    const handleOpenCamera = () => {
        if (status !== 'idle') handleStopListening();
        setCameraOpen(true);
    };

    const handleOpenDashboard = () => {
        if(status !== 'idle') handleStopListening();
        setDashboardOpen(true);
    };
    
    const handleOpenStaffAccess = () => {
        if(status !== 'idle') handleStopListening();
        setIsStaffAccessOpen(true);
    };

    const handleAuthSuccess = () => {
        setIsAuthFormVisible(false);
        setGeminiResponse("Login/Cadastro realizado com sucesso!");
    };
    
    const handleClientViewButtonClick = (view: string) => {
        if (status !== 'idle') handleStopListening();
        setClientView(view);
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-transparent">
            <div className={\`w-full h-full transition-all duration-300 \${isManualSchedulingOpen ? 'blur-md brightness-50' : ''}\`} style={isManualSchedulingOpen ? { pointerEvents: 'none'} : {}}>
                {backgrounds.map((bg, index) => {
                    const isCurrent = index === currentBgIndex;
                    const isPrevious = index === previousBgIndex;
                    const shouldRender = isCurrent || (isPrevious && isTransitioning);

                    if (!shouldRender) return null;

                    const animationClassMap = {
                        visible: \`transition-enter-\${transitionStyle}\`,
                        leaving: \`transition-leave-\${transitionStyle}\`,
                    };
                    
                    let animationClass = '';
                    let zIndex = 1;
                    const crossFadeTransitions = ['fade', 'zoom-in', 'zoom-out', 'blur', 'rotate-in'];
                    
                    if (isTransitioning && isPrevious !== undefined) {
                        if (crossFadeTransitions.includes(transitionStyle)) {
                            animationClass = isCurrent ? '' : animationClassMap.leaving;
                            zIndex = isCurrent ? 1 : 2;
                        } else {
                            animationClass = isCurrent ? animationClassMap.visible : '';
                            zIndex = isCurrent ? 2 : 1;
                        }
                    } else if (isCurrent) {
                        animationClass = previousBgIndex === undefined ? 'animate-fade-in' : '';
                        zIndex = 1;
                    }

                    return (
                        <img
                            key={bg.url + index}
                            src={bg.url}
                            alt=""
                            className={\`absolute inset-0 w-full h-full object-cover \${animationClass}\`}
                            style={{
                                objectPosition: \`\${bg.position.x}% \${bg.position.y}%\`,
                                transform: \`scale(\${bg.zoom})\`,
                                animationDuration: \`\${transitionDuration}ms\`,
                                zIndex: zIndex,
                            }}
                        />
                    );
                })}
                
                {overlaySettings.enabled && (
                    <div 
                        className="absolute inset-0 z-0"
                        style={{ backgroundColor: overlaySettings.color, opacity: overlaySettings.opacity }}
                    />
                )}

                <Header onMenuClick={handleOpenDashboard} onStaffAccessClick={handleOpenStaffAccess} titleSettings={titleSettings} headerSettings={headerSettings}/>
                <WaveformVisualizer status={status} isAiSpeaking={isAiSpeaking} styleId={visualizerStyle} />
                
                 {appState === 'welcome' && !clientView && (
                    <>
                        {ctaSettings.enabled && (
                            <CTAButton 
                                settings={ctaSettings} 
                                onClick={handleStartConversation} 
                                disabled={!isCtaButtonEnabled}
                            />
                        )}
                        <FloatingActionButtons onButtonClick={handleClientViewButtonClick} />
                    </>
                )}

                <BottomInputBar
                    onSendText={handleSendTextFromBar}
                    onOpenCamera={handleOpenCamera}
                    isVoiceSessionActive={isCallActive}
                />
            </div>
            
            {appState === 'chat' && isAuthFormVisible && (
                <AuthForm 
                    mode={authFormMode} 
                    onModeChange={setAuthFormMode}
                    onAuthSuccess={handleAuthSuccess}
                    onClose={() => setIsAuthFormVisible(false)}
                    isVoiceSessionActive={isCallActive}
                    status={status}
                    isAiSpeaking={isAiSpeaking}
                    onStopListening={handleStop}
                />
            )}
            
            {(geminiResponse || isLoadingResponse) && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-full max-w-2xl p-4 animate-fade-in">
                    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 text-white text-center shadow-2xl">
                        {isLoadingResponse ? "Pensando..." : geminiResponse}
                    </div>
                </div>
            )}
            
            {isCallActive && !isAuthFormVisible && !isManualSchedulingOpen && (
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4 transition-all duration-300">
                    <StopButton
                        onClick={handleStop}
                        className="w-24 h-24"
                        status={status}
                        isAiSpeaking={isAiSpeaking}
                    />
                    <StatusText
                        status={status}
                        isAiSpeaking={isAiSpeaking}
                    />
                    <ManualScheduleButton onClick={() => setIsManualSchedulingOpen(true)} />
                </div>
            )}

            {confirmedAppointment && (
                <AppointmentConfirmationCard 
                    appointment={confirmedAppointment}
                    services={services}
                    onClose={() => setConfirmedAppointment(null)}
                />
            )}
            
            {clientView && (
                <div className="absolute inset-0 bg-gray-100/90 text-gray-800 backdrop-blur-md z-30 animate-fade-in overflow-y-auto">
                    {clientView === 'appointments' && <AppointmentManager appointments={appointments} onAppointmentsChange={handleAppointmentsChange} customers={customers} services={services} onBack={() => setClientView(null)} />}
                    {clientView === 'services' && <ServiceManager services={services} combos={combos} onBack={() => setClientView(null)} />}
                    {clientView === 'team' && <EmployeeManager employees={employees} onEmployeesChange={handleEmployeesChange} services={services} onBack={() => setClientView(null)} />}
                    {clientView === 'hours' && <SalonHoursManager settings={salonHoursSettings} onSettingsChange={handleSalonHoursChange} onBack={() => setClientView(null)} />}
                    {clientView === 'subscriptions' && <SubscriptionView plans={subscriptionPlans} onBack={() => setClientView(null)} />}
                    {clientView === 'contact' && <ContactView onBack={() => setClientView(null)} />}
                    {clientView === 'gallery' && <GalleryView onBack={() => setClientView(null)} images={backgrounds} />}
                </div>
            )}

            {isManualSchedulingOpen && (
                <ManualScheduling
                    onClose={() => setIsManualSchedulingOpen(false)}
                    services={services}
                    employees={employees}
                    appointments={appointments}
                    status={status}
                    isAiSpeaking={isAiSpeaking}
                    onStopListening={handleStop}
                    onConfirmAppointment={handleConfirmManualAppointment}
                />
            )}

            {isDashboardOpen && (
                <Dashboard
                    onClose={() => setDashboardOpen(false)}
                    backgrounds={backgrounds}
                    onBackgroundsChange={setBackgrounds}
                    isRotationEnabled={isRotationEnabled}
                    onRotationToggle={setRotationEnabled}
                    rotationInterval={rotationInterval}
                    onRotationIntervalChange={setRotationInterval}
                    transitionDuration={transitionDuration}
                    onTransitionDurationChange={setTransitionDuration}
                    transitionStyle={transitionStyle}
                    onTransitionStyleChange={setTransitionStyle}
                    visualizerStyle={visualizerStyle}
                    onVisualizerStyleChange={setVisualizerStyle}
                    overlaySettings={overlaySettings}
                    onOverlaySettingsChange={setOverlaySettings}
                    titleSettings={titleSettings}
                    onTitleSettingsChange={setTitleSettings}
                    headerSettings={headerSettings}
                    onHeaderSettingsChange={setHeaderSettings}
                    micGain={micGain}
                    onMicGainChange={setMicGain}
                    isNoiseReductionEnabled={isNoiseReductionEnabled}
                    onNoiseReductionToggle={setNoiseReductionEnabled}
                    ctaSettings={ctaSettings}
                    onCtaSettingsChange={setCtaSettings}
                    services={services}
                    onServicesChange={handleServicesChange}
                    employees={employees}
                    onEmployeesChange={handleEmployeesChange}
                    customers={customers}
                    onCustomersChange={handleCustomersChange}
                    appointments={appointments}
                    onAppointmentsChange={handleAppointmentsChange}
                    transactions={transactions}
                    onTransactionsChange={handleTransactionsChange}
                    subscriptionPlans={subscriptionPlans}
                    onSubscriptionPlansChange={handleSubscriptionPlansChange}
                    subscriptionSettings={subscriptionSettings}
                    onSubscriptionSettingsChange={handleSubscriptionSettingsChange}
                    materials={materials}
                    onMaterialsChange={handleMaterialsChange}
                    serviceRecipes={serviceRecipes}
                    onServiceRecipesChange={handleServiceRecipesChange}
                    combos={combos}
                    onCombosChange={handleCombosChange}
                    costSettings={costSettings}
                    onCostSettingsChange={handleCostSettingsChange}
                    isMemoryEnabled={isMemoryEnabled}
                    onMemoryEnabledChange={handleMemoryEnabledChange}
                    memoryText={memoryText}
                    onMemoryTextChange={handleMemoryTextChange}
                    memoryBoxSettings={memoryBoxSettings}
                    onMemoryBoxSettingsChange={handleMemoryBoxSettingsChange}
                    salonHoursSettings={salonHoursSettings}
                    onSalonHoursSettingsChange={handleSalonHoursChange}
                    auditLogs={auditLogs}
                    onAddLog={addLog}
                    costPerMinute={costPerMinute}
                    cardOrder={cardOrder}
                    onCardOrderChange={handleCardOrderChange}
                />
            )}

            {isStaffAccessOpen && (
                <StaffAccessModal
                    onClose={() => setIsStaffAccessOpen(false)}
                    employees={employees}
                    appointments={appointments}
                    onAppointmentsChange={handleAppointmentsChange}
                />
            )}

            {isCameraOpen && <CameraView onClose={() => setCameraOpen(false)} />}
        </div>
    );
};

export default App;--- END OF FILE App.tsx ---

... (rest of the files are included in the same manner) ...
`;
};