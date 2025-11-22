// components/ManualScheduling.tsx
import React, { useState, useMemo, useEffect } from 'react';
import type { Service, Employee, Appointment } from '../types';
import { CloseIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, UserIcon } from './Icons';
import StopButton from './StopButton';
import StatusText from './StatusText';
import { toYYYYMMDD } from '../utils/date';


type Status = 'idle' | 'connecting' | 'listening' | 'error';
type ScheduleSubStep = 'professional' | 'suggestions' | 'calendar_fallback' | 'time_fallback';

interface ManualSchedulingProps {
    onClose: () => void;
    services: Service[];
    employees: Employee[];
    appointments: Appointment[];
    status: Status;
    isAiSpeaking: boolean;
    onStopListening: () => void;
    onConfirmAppointment: (appointment: Omit<Appointment, 'id'>) => void;
}

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ["Serviço", "Profissional & Hora", "Resumo"];
    return (
        <div className="flex items-center justify-center w-full px-4 sm:px-6">
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                return (
                    <React.Fragment key={stepNumber}>
                        <div className="flex flex-col items-center text-center w-24">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 ${isCompleted ? 'bg-pink-500 border-pink-500' : isActive ? 'bg-white border-pink-500' : 'bg-white border-gray-300'}`}>
                                {isCompleted ? <span className="text-white font-bold">✓</span> : <span className={`font-bold ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>{stepNumber}</span>}
                            </div>
                            <p className={`mt-2 text-sm font-semibold transition-colors duration-300 ${isActive || isCompleted ? 'text-pink-500' : 'text-gray-400'}`}>{label}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 transition-colors duration-300 ${isCompleted ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


const ManualScheduling: React.FC<ManualSchedulingProps> = ({ onClose, services, employees, appointments, status, isAiSpeaking, onStopListening, onConfirmAppointment }) => {
    const [step, setStep] = useState(1);
    const [scheduleSubStep, setScheduleSubStep] = useState<ScheduleSubStep>('professional');
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewingDate, setViewingDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [datePage, setDatePage] = useState(0);

    const professionals = useMemo(() => employees.filter(e => e.status === 'Ativo' && e.accessLevel === 'Profissional'), [employees]);
    const selectedService = useMemo(() => services.find(s => s.id === selectedServiceId), [services, selectedServiceId]);
    const selectedProfessional = useMemo(() => professionals.find(p => p.id === selectedProfessionalId), [professionals, selectedProfessionalId]);
    
    const soonestSlot = useMemo(() => {
        if (step !== 2 || scheduleSubStep !== 'professional' || !selectedService) {
            return null;
        }

        const eligibleProfessionals = professionals.filter(p => 
            p.servicesPerformed?.includes(selectedService.id)
        );

        if (eligibleProfessionals.length === 0) return null;

        const bookedSlots = new Map<string, boolean>();
        appointments.forEach(apt => {
            const pro = employees.find(e => e.name === apt.professional);
            if (pro) {
                const key = `${apt.date}:${apt.time}:${pro.id}`;
                bookedSlots.set(key, true);
            }
        });

        const now = new Date();
        const startDate = new Date();
        
        const minutes = now.getMinutes();
        if (minutes < 30) {
            startDate.setMinutes(30, 0, 0);
        } else {
            startDate.setHours(now.getHours() + 1, 0, 0, 0);
        }

        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek === 0) continue; // Skip Sundays

            for (let hour = 8; hour < 18; hour++) {
                for (let minute of [0, 30]) {
                    const slotTime = new Date(currentDate);
                    slotTime.setHours(hour, minute);

                    if (slotTime < now) continue;

                    const dateStr = toYYYYMMDD(slotTime);
                    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    
                    for (const pro of eligibleProfessionals) {
                        const key = `${dateStr}:${timeStr}:${pro.id}`;
                        if (!bookedSlots.has(key)) {
                            return {
                                date: slotTime,
                                time: timeStr,
                                professional: pro,
                            };
                        }
                    }
                }
            }
        }

        return null;
    }, [step, scheduleSubStep, selectedService, professionals, appointments, employees]);

    const allNextAvailableDates = useMemo(() => {
        if (!selectedProfessionalId) return [];
        const availableDates: Date[] = [];
        const checkedDates = new Set<string>();
        const now = new Date();
        const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const professionalAppointments = appointments
            .filter(apt => apt.professional === selectedProfessional?.name)
            .map(apt => `${apt.date}T${apt.time}`);
        const bookedSlots = new Set(professionalAppointments);

        for (let i = 0; i < 90; i++) {
            const currentDate = new Date(startDate);
            currentDate.setUTCDate(startDate.getUTCDate() + i);
            const dateStr = toYYYYMMDD(currentDate);

            if (checkedDates.has(dateStr)) continue;

            const dayOfWeek = currentDate.getUTCDay();
            if (dayOfWeek === 0) { // Skip Sundays
                checkedDates.add(dateStr);
                continue;
            }
            
            let hasSlot = false;
            for (let hour = 8; hour < 18; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const slotDate = new Date(currentDate);
                    slotDate.setUTCHours(hour, minute, 0, 0);
                    
                    if (slotDate < now) continue;

                    const slotKey = `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    
                    if (!bookedSlots.has(slotKey)) {
                        hasSlot = true;
                        break;
                    }
                }
                if (hasSlot) break;
            }

            if (hasSlot) {
                availableDates.push(currentDate);
            }
            checkedDates.add(dateStr);
        }
        return availableDates;
    }, [selectedProfessionalId, appointments, selectedProfessional]);
    
    const paginatedDates = useMemo(() => {
        return allNextAvailableDates.slice(datePage * 8, (datePage + 1) * 8);
    }, [allNextAvailableDates, datePage]);


    const availableTimesForDate = useMemo(() => {
        if (!viewingDate || !selectedProfessionalId) return [];
        const dateStr = toYYYYMMDD(viewingDate);
        const professionalAppointments = appointments
            .filter(apt => apt.professional === selectedProfessional?.name && apt.date === dateStr)
            .map(apt => apt.time);
        const bookedTimes = new Set(professionalAppointments);
        
        const times: string[] = [];
        const now = new Date();

        for (let hour = 8; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const slotDate = new Date(viewingDate);
                slotDate.setUTCHours(hour, minute);

                if (slotDate < now) continue;

                const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                if (!bookedTimes.has(timeStr)) {
                    times.push(timeStr);
                }
            }
        }
        return times;
    }, [viewingDate, selectedProfessionalId, appointments, selectedProfessional]);
    
    useEffect(() => {
        if (scheduleSubStep === 'suggestions' && paginatedDates.length > 0) {
            const isViewingDateInPage = viewingDate && paginatedDates.some(d => toYYYYMMDD(d) === toYYYYMMDD(viewingDate));
            if (!isViewingDateInPage) {
                 setViewingDate(paginatedDates[0]);
            }
        }
        if (scheduleSubStep !== 'suggestions') {
            setViewingDate(null);
        }
    }, [scheduleSubStep, paginatedDates, viewingDate]);

    const handleNextStep = () => {
        if (step === 1 && selectedServiceId) {
            setStep(2);
        }
        if (step === 2 && selectedTime && selectedDate) {
             setStep(3);
        }
    };

    const handlePrevStep = () => {
        if (step === 3) {
            setSelectedTime(null);
            setCustomerName('');
            setStep(2);
        } else if (step === 2) {
            setSelectedServiceId(null);
            setSelectedProfessionalId(null);
            setSelectedTime(null); // Reset time when going back to service selection
            setScheduleSubStep('professional');
            setStep(1);
        }
    };

    const handleProfessionalSelect = (proId: string) => {
        setSelectedProfessionalId(proId);
        setSelectedTime(null); // Reset time when professional changes
        setScheduleSubStep('suggestions');
    };

    const handleSoonestSlotClick = () => {
        if (!soonestSlot) return;

        setSelectedProfessionalId(soonestSlot.professional.id);
        setSelectedDate(soonestSlot.date);
        setSelectedTime(soonestSlot.time);
        setStep(3);
    };
    
     const handleConfirm = () => {
        if (!customerName.trim()) {
            alert("Por favor, informe seu nome.");
            return;
        }
        if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
            alert("Ocorreu um erro. Por favor, tente novamente.");
            return;
        }

        const newAppointmentData: Omit<Appointment, 'id'> = {
            date: toYYYYMMDD(selectedDate),
            time: selectedTime,
            customerId: 'manual_new',
            customerName: customerName,
            phone: 'Não informado',
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            professional: selectedProfessional.name,
            price: selectedService.price,
            status: 'Agendado',
            paymentStatus: 'Pendente',
        };
        onConfirmAppointment(newAppointmentData);
    };
    
    const isCallActive = status !== 'idle';

    return (
        <div id="manual-scheduling-panel" className="fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-gray-50 text-gray-800 z-40 flex flex-col transition-enter-slide-right shadow-2xl" style={{ animationDuration: '400ms' }}>
            <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Agendamento Manual</h2>
                <div className="flex items-center gap-2">
                    {isCallActive && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <StatusText status={status} isAiSpeaking={isAiSpeaking} size="small"/>
                            <StopButton 
                                onClick={onStopListening} 
                                className="w-14 h-14"
                                status={status}
                                isAiSpeaking={isAiSpeaking}
                            />
                        </div>
                    )}
                    <button id="manual-schedule-close-button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </div>
            </header>

            <div className="py-6 border-b border-gray-200">
                <Stepper currentStep={step} />
            </div>

            <div id="manual-scheduling-content" className="flex-grow overflow-y-auto">
                {step === 1 && (
                    <div className="p-4 space-y-3">
                        {services.map(service => (
                            <button
                                key={service.id}
                                id={`manual-schedule-service-${service.id}`}
                                onClick={() => setSelectedServiceId(service.id)}
                                className={`w-full text-left p-4 bg-white border rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:border-pink-300 ${selectedServiceId === service.id ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200'}`}
                            >
                                <p className="font-semibold">{service.name}</p>
                                <p className="text-sm text-gray-500">R$ {service.price.toFixed(2).replace('.', ',')} - {service.duration} min</p>
                            </button>
                        ))}
                    </div>
                )}
                {step === 2 && scheduleSubStep === 'professional' && (
                     <div className="p-4 space-y-3 animate-fade-in">
                        
                        {soonestSlot && (
                            <>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-800">Próximo horário livre</p>
                                    <button
                                        id="manual-schedule-soonest-slot-button"
                                        onClick={handleSoonestSlotClick} 
                                        className="w-full mt-2 p-3 bg-pink-500 text-white rounded-lg shadow-lg hover:bg-pink-600 transition-transform transform hover:scale-105 active:scale-100"
                                    >
                                        <p className="font-bold text-lg">
                                            {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(soonestSlot.date).replace(/^\w/, (c) => c.toUpperCase())} às {soonestSlot.time}
                                        </p>
                                        <p className="text-sm">com {soonestSlot.professional.name}</p>
                                    </button>
                                </div>

                                <div className="relative flex py-4 items-center">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                    <span className="flex-shrink mx-4 text-gray-400 text-sm uppercase">ou</span>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>
                            </>
                        )}

                        {professionals.map(pro => (
                            <button
                                id={`manual-schedule-professional-${pro.id}`}
                                key={pro.id} 
                                onClick={() => handleProfessionalSelect(pro.id)}
                                className="w-full p-3 rounded-lg text-left transition-all shadow-sm flex items-center gap-4 bg-white hover:bg-gray-100 border border-gray-200"
                            >
                                <img src={pro.imageUrl} alt={pro.name} className="w-14 h-14 rounded-full object-cover"/>
                                <div>
                                    <p className="font-bold text-gray-800">{pro.name}</p>
                                    <p className="text-sm text-gray-500">{pro.specialty}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                {step === 2 && scheduleSubStep === 'suggestions' && selectedProfessional && (
                    <div className="p-4 space-y-6 animate-fade-in">
                        <div className="p-3 rounded-lg flex items-center gap-4 bg-white border border-gray-200 shadow-sm">
                             <img src={selectedProfessional.imageUrl} alt={selectedProfessional.name} className="w-14 h-14 rounded-full object-cover"/>
                            <div>
                                <p className="font-bold text-gray-800">{selectedProfessional.name}</p>
                                <p className="text-sm text-gray-500">{selectedProfessional.specialty}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-3">Escolha uma das próximas 8 datas disponíveis</h3>
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {paginatedDates.map((date, index) => {
                                    const isSelected = viewingDate && toYYYYMMDD(viewingDate) === toYYYYMMDD(date);
                                    return (
                                        <button
                                            id={`manual-schedule-date-${toYYYYMMDD(date)}`}
                                            key={index}
                                            onClick={() => {
                                                setViewingDate(date);
                                                setSelectedTime(null); // Reset time when viewing date changes
                                            }}
                                            className={`p-2 rounded-lg border text-center transition-colors ${
                                                isSelected
                                                    ? 'bg-pink-500 text-white border-pink-500'
                                                    : 'bg-white border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            <p className="text-xs font-semibold uppercase">{date.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '')}</p>
                                            <p className="font-bold text-xl">{date.getUTCDate()}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <h3 className="font-semibold text-gray-700 mb-3">
                                Horários para {viewingDate?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', timeZone: 'UTC' })}
                            </h3>
                            
                            <div className="grid grid-cols-4 gap-2">
                                {availableTimesForDate.map(time => {
                                    const isSelected = selectedTime === time && viewingDate && toYYYYMMDD(selectedDate) === toYYYYMMDD(viewingDate);
                                    return (
                                        <button
                                            id={`manual-schedule-time-${time.replace(':', '')}`}
                                            key={time}
                                            onClick={() => { setSelectedTime(time); if (viewingDate) setSelectedDate(viewingDate); }}
                                            className={`py-3 text-sm font-semibold rounded-md transition-colors ${
                                                isSelected
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-white border border-gray-200 hover:bg-pink-100'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                                {availableTimesForDate.length === 0 && <p className="col-span-4 text-center text-sm text-gray-500 py-4">Nenhum horário vago para esta data.</p>}
                            </div>
                             <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                                <p className="text-center text-sm text-gray-600 mb-2">Não encontrou o que queria?</p>
                                <div className="flex justify-center items-center gap-2">
                                    {datePage > 0 && <button id="manual-schedule-prev-date-page" onClick={() => setDatePage(p => p - 1)} className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"><ChevronLeftIcon /></button>}
                                    <button
                                        id="manual-schedule-other-dates-button"
                                        onClick={() => setDatePage(p => p + 1)}
                                        disabled={datePage * 8 + 8 >= allNextAvailableDates.length}
                                        className="w-full text-center py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <CalendarIcon className="w-5 h-5" />
                                        Ver Próximas Datas
                                    </button>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="p-6 space-y-4 animate-fade-in">
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Resumo do agendamento</h3>
                        <div className="space-y-3 text-gray-700">
                             <div className="flex justify-between items-center"><span className="font-semibold">Serviço:</span><span>{selectedService?.name}</span></div>
                             <div className="flex justify-between items-center"><span className="font-semibold">Profissional:</span><span>{selectedProfessional?.name}</span></div>
                             <div className="flex justify-between items-center"><span className="font-semibold">Data:</span><span>{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', timeZone: 'UTC' })}</span></div>
                             <div className="flex justify-between items-center"><span className="font-semibold">Hora:</span><span>{selectedTime}</span></div>
                             <div className="flex justify-between items-center text-lg font-bold pt-2 border-t"><span className="text-pink-600">Total:</span><span className="text-pink-600">R$ {selectedService?.price.toFixed(2).replace('.', ',')}</span></div>
                        </div>
                        <div className="pt-4 border-t">
                            <label htmlFor="manual-schedule-customer-name-input" className="block text-sm font-medium text-gray-600 mb-1">Seu nome</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-5 w-5 text-gray-400" /></div>
                                <input id="manual-schedule-customer-name-input" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Digite seu nome completo" className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md"/>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <footer className="flex-shrink-0 p-4 bg-white border-t border-gray-200 shadow-inner">
                <div className="flex gap-3">
                     {(step > 1) && (
                        <button
                            id="manual-schedule-back-button"
                            onClick={handlePrevStep}
                            className="w-1/3 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Voltar
                        </button>
                    )}
                    <button
                        id="manual-schedule-next-button"
                        onClick={step === 3 ? handleConfirm : handleNextStep}
                        disabled={(step === 1 && !selectedServiceId) || (step === 2 && !selectedTime) || (step === 3 && !customerName.trim())}
                        className="flex-grow py-3 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition-colors disabled:bg-pink-300 disabled:cursor-not-allowed"
                    >
                        {step === 3 ? 'Confirmar Agendamento' : 'Avançar'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ManualScheduling;
