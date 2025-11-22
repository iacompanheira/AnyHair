
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
import { DEFAULT_MEMORY_TEXT, WELCOME_PHRASES, IDLE_REMINDER_PHRASE } from './constants/prompts';
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

    // FIX: Safeguard GoogleGenAI initialization to prevent White/Black Screen on Vercel if API Key is missing
    const ai = useMemo(() => {
        try {
            return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        } catch (e) {
            console.error("Falha ao inicializar GoogleGenAI. Verifique sua API_KEY.", e);
            return null;
        }
    }, []);

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
    const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
            if (added) addLog('service', `Serviço <strong>${added.name}</strong> adicionado.`);
        } else if (newServices.length < services.length) {
            const removed = services.find(os => !newServices.some(ns => ns.id === os.id));
             if (removed) addLog('service', `Serviço <strong>${removed.name}</strong> removido.`);
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
            if(added) addLog('customer', `Cliente <strong>${added.name}</strong> foi adicionado.`);
        } else if (newCustomers.length < customers.length) {
            const removed = customers.find(oc => !newCustomers.some(nc => nc.id === oc.id));
            if(removed) addLog('customer', `Cliente <strong>${removed.name}</strong> foi removido.`);
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
        addLog('assistant', `Memória da assistente foi <strong>${enabled ? 'ativada' : 'desativada'}</strong>.`);
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
        addLog('appointment', `Agendamento para <strong>${newAppointment.customerName}</strong> (${newAppointment.serviceName}) criado manualmente.`);
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

    // Play welcome message once on load with frequency limiting
    useEffect(() => {
        const playWelcomeMessage = async () => {
            if (!navigator.onLine || !ai) return;
            
            // --- FREQUENCY LIMITING LOGIC START ---
            const STORAGE_KEY = 'anyhair_welcome_stats';
            const MIN_INTERVAL = 4 * 60 * 1000; // 4 minutes
            const HOURLY_LIMIT = 15;
            const ONE_HOUR = 60 * 60 * 1000;

            const now = Date.now();
            const storedRaw = localStorage.getItem(STORAGE_KEY);
            let stats = storedRaw 
                ? JSON.parse(storedRaw) 
                : { lastPlayed: 0, count: 0, windowStart: now };

            // 1. Reset hourly window if expired
            if (now - stats.windowStart > ONE_HOUR) {
                stats.count = 0;
                stats.windowStart = now;
            }

            // 2. Check constraints
            const timeSinceLast = now - stats.lastPlayed;
            if (timeSinceLast < MIN_INTERVAL) {
                console.log(`Welcome message skipped. Too soon (${Math.floor(timeSinceLast/1000)}s < ${MIN_INTERVAL/1000}s).`);
                return;
            }

            if (stats.count >= HOURLY_LIMIT) {
                console.log("Welcome message skipped. Hourly limit reached.");
                return;
            }
            // --- FREQUENCY LIMITING LOGIC END ---

            try {
                const randomPhrase = WELCOME_PHRASES[Math.floor(Math.random() * WELCOME_PHRASES.length)];

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-preview-tts',
                    contents: [{ parts: [{ text: randomPhrase }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    },
                });
                
                if (conversationInitiatedRef.current) return;

                const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    // Update Storage ONLY if we actually play
                    stats.lastPlayed = now;
                    stats.count = stats.count + 1;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

                    const source = await playAudioFromBase64(base64Audio);
                    if (source) {
                        welcomeAudioSourceRef.current = source;
                         source.addEventListener('ended', () => {
                            if (welcomeAudioSourceRef.current === source) {
                                welcomeAudioSourceRef.current = null;
                            }
                        });
                    }

                    // Start 2-minute idle timer only if welcome played
                    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
                    idleTimeoutRef.current = setTimeout(async () => {
                        if (!conversationInitiatedRef.current && navigator.onLine && ai) {
                            try {
                                const idleResponse = await ai.models.generateContent({
                                    model: 'gemini-2.5-flash-preview-tts',
                                    contents: [{ parts: [{ text: IDLE_REMINDER_PHRASE }] }],
                                    config: {
                                        responseModalities: [Modality.AUDIO],
                                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                                    },
                                });
                                if (!conversationInitiatedRef.current) {
                                    const idleAudio = idleResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                                    if (idleAudio) {
                                        await playAudioFromBase64(idleAudio);
                                    }
                                }
                            } catch (e) {
                                console.warn("Failed to play idle reminder", e);
                            }
                        }
                    }, 120000); // 120,000 ms = 2 minutes
                }

            } catch (error) {
                console.warn("Welcome message skipped due to error:", error);
            }
        };

        if (!hasPlayedWelcome) {
            setHasPlayedWelcome(true);
            const timer = setTimeout(() => {
                 playWelcomeMessage();
            }, 1000);
            return () => {
                clearTimeout(timer);
                if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
            };
        }
        return () => {
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        };
    }, [hasPlayedWelcome, playAudioFromBase64, ai]);
    
    // Play TTS message when a confirmation card is shown
    useEffect(() => {
        if (confirmedAppointment && ai) {
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
            const { customerName, serviceName, date, time } = fc.args as any;
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
                addLog('appointment', `Agendamento para <strong>${customerName}</strong> (${serviceName}) criado pela IA.`);
                if (isCallActive) {
                    handleStopListening(); // End voice call to show confirmation
                }
                result = `Agendamento para ${customerName} criado com sucesso.`;
            } else {
                result = `Serviço "${serviceName}" não encontrado.`;
            }
        } else if (fc.name === 'highlightElement') {
            const { elementId, duration } = fc.args as any;
            result = await highlightElement(elementId, duration);
        } else if (fc.name === 'clickElement') {
            const { elementId } = fc.args as any;
            result = clickElement(elementId);
        } else if (fc.name === 'scrollElement') {
            const { elementId, direction, amount } = fc.args as any;
            result = scrollElement(elementId, direction, amount);
        } else if (fc.name === 'typeText') {
            const { elementId, text } = fc.args as any;
            result = typeText(elementId, text);
        }
        return result;
    }, [services, customers, addLog, handleStopListening, isCallActive]);

    
    const handleStartListening = useCallback(async () => {
        if (!navigator.onLine) {
            alert("Você está offline. Verifique sua conexão com a internet.");
            return;
        }
        if (!ai) {
            alert("Erro de configuração: API Key não encontrada. O assistente não pode iniciar.");
            return;
        }

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
                dynamicSystemInstruction += `\n\n--- DADOS ATUALIZADOS DO SISTEMA ---\n${contextData}`;
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
                        console.warn('Live API Error:', e); // Changed to warn to avoid console noise
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
        if (chatSessionRef.current || !ai) return;
        
        let dynamicSystemInstruction = isMemoryEnabled ? memoryText : '';
        if (isMemoryEnabled) {
            const contextData = [
                formatServicesForPrompt(services),
                formatEmployeesForPrompt(employees),
            ].join('\n\n---\n\n');
            dynamicSystemInstruction += `\n\n--- DADOS ATUALIZADOS DO SISTEMA ---\n${contextData}`;
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
            
            if (chatSessionRef.current) {
                const chat = chatSessionRef.current;
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
            } else {
                setGeminiResponse("Assistente não disponível (Erro de API Key).");
            }

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
        // Clear idle timer if user starts conversation
        if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = null;
        }

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
            <div className={`w-full h-full transition-all duration-300 ${isManualSchedulingOpen ? 'blur-md brightness-50' : ''}`} style={isManualSchedulingOpen ? { pointerEvents: 'none'} : {}}>
                {backgrounds.map((bg, index) => {
                    const isCurrent = index === currentBgIndex;
                    const isPrevious = index === previousBgIndex;
                    const shouldRender = isCurrent || (isPrevious && isTransitioning);

                    if (!shouldRender) return null;

                    const animationClassMap = {
                        visible: `transition-enter-${transitionStyle}`,
                        leaving: `transition-leave-${transitionStyle}`,
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
                            className={`absolute inset-0 w-full h-full object-cover ${animationClass}`}
                            style={{
                                objectPosition: `${bg.position.x}% ${bg.position.y}%`,
                                transform: `scale(${bg.zoom})`,
                                animationDuration: `${transitionDuration}ms`,
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
                {/* Stealth Mode: Hide WaveformVisualizer on welcome screen */}
                {appState === 'chat' && <WaveformVisualizer status={status} isAiSpeaking={isAiSpeaking} styleId={visualizerStyle} />}
                
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

                {appState === 'chat' && (
                    <BottomInputBar
                        onSendText={handleSendTextFromBar}
                        onOpenCamera={handleOpenCamera}
                        isVoiceSessionActive={isCallActive}
                    />
                )}
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
                 <div className="absolute left-1/2 bottom-20 -translate-x-1/2 z-20 flex flex-col items-center gap-4 transition-all duration-300">
                    <StopButton
                        onClick={handleStop}
                        className="w-10 h-10"
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

export default App;
