// components/dashboard/pricing/CostConfigurationPanel.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { CostSettings, Employee, PersonnelCosts, OperationalCosts, AdministrativeCosts, TaxCosts } from '../../../types';
import SaveBar from '../SaveBar';
import { ChevronDownIcon, DollarIcon, PieChartIcon, UsersIcon } from '../Icons';
import CostInput from './CostInput';
import CostPieChart from './CostPieChart';

interface CostConfigurationPanelProps {
    costSettings: CostSettings;
    onCostSettingsChange: (settings: CostSettings) => void;
    employees: Employee[];
}

const AccordionSection: React.FC<React.PropsWithChildren<{ title: string; icon: React.ReactNode; initiallyOpen?: boolean }>> = ({ title, icon, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="bg-white/80 border border-gray-200 rounded-xl transition-shadow hover:shadow-md">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-md font-semibold text-gray-700">{title}</h3>
                </div>
                <ChevronDownIcon className={`transform transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 border-t border-gray-200 animate-fade-in">{children}</div>}
        </div>
    );
};


const CostConfigurationPanel: React.FC<CostConfigurationPanelProps> = ({ costSettings: initialCostSettings, onCostSettingsChange, employees }) => {
    const [draft, setDraft] = useState(initialCostSettings);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // Sync employee list from props into the draft state, preserving overrides
        const employeeMap = new Map(draft.personnel.employees.map(e => [e.id, e.salaryOverride]));
        const syncedEmployees = employees.map(e => ({
            id: e.id,
            name: e.name,
            salaryOverride: employeeMap.get(e.id)
        }));
        setDraft(prev => ({...prev, personnel: {...prev.personnel, employees: syncedEmployees}}));
    }, [employees]);


    useEffect(() => {
        setHasChanges(JSON.stringify(draft) !== JSON.stringify(initialCostSettings));
    }, [draft, initialCostSettings]);

    const handleSave = () => onCostSettingsChange(draft);
    const handleCancel = () => setDraft(initialCostSettings);

    const handleFieldChange = <T extends keyof CostSettings, K extends keyof CostSettings[T]>(
        section: T,
        field: K,
        value: string
    ) => {
        const numValue = parseFloat(value) || 0;
        setDraft(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: numValue
            }
        }));
    };
    
    const handleEmployeeSalaryChange = (employeeId: string, value: string) => {
        const numValue = parseFloat(value);
        setDraft(prev => ({
            ...prev,
            personnel: {
                ...prev.personnel,
                employees: prev.personnel.employees.map(e => 
                    e.id === employeeId ? { ...e, salaryOverride: isNaN(numValue) ? undefined : numValue } : e
                )
            }
        }));
    };

    const calculations = useMemo(() => {
        const totalSalary = draft.personnel.employees.reduce((sum, emp) => {
            const salary = emp.salaryOverride ?? draft.personnel.defaultBaseSalary;
            return sum + salary;
        }, 0);
        
        const personnelCost = totalSalary * (1 + draft.personnel.socialCharges / 100);
        const operationalCost = Object.values(draft.operational).reduce<number>((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        const administrativeCost = Object.values(draft.administrative).reduce<number>((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        const fixedTaxes = draft.taxes.fixedTaxes;
        
        const totalMonthlyCost = personnelCost + operationalCost + administrativeCost + fixedTaxes;
        
        const totalMonthlyHours = draft.personnel.workingDaysInMonth * draft.personnel.workingHoursPerDay;
        const costPerHour = totalMonthlyHours > 0 ? totalMonthlyCost / totalMonthlyHours : 0;
        const costPerMinute = costPerHour / 60;

        return {
            personnelCost,
            operationalCost,
            administrativeCost,
            taxCost: fixedTaxes, // only fixed for this calc
            totalMonthlyCost,
            costPerHour,
            costPerMinute,
        };
    }, [draft]);

    const chartData = [
        { label: "Pessoal", value: calculations.personnelCost, color: "#4F46E5" },
        { label: "Operacional", value: calculations.operationalCost, color: "#EC4899" },
        { label: "Administrativo", value: calculations.administrativeCost, color: "#F59E0B" },
        { label: "Impostos Fixos", value: calculations.taxCost, color: "#8B5CF6" },
    ];

    return (
        <div className="w-full h-full relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
                {/* Left Column: Inputs */}
                <div className="lg:col-span-2 space-y-4">
                    <AccordionSection title="Custos com Pessoal" icon={<UsersIcon className="w-5 h-5 text-pink-500" />} initiallyOpen>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <CostInput label="Salário Base Padrão" type="currency" value={draft.personnel.defaultBaseSalary} onChange={v => handleFieldChange('personnel', 'defaultBaseSalary', v)} tooltip="Salário padrão para funcionários sem um valor específico definido."/>
                             <CostInput label="Dias Úteis no Mês" value={draft.personnel.workingDaysInMonth} onChange={v => handleFieldChange('personnel', 'workingDaysInMonth', v)} tooltip="Número médio de dias trabalhados no mês, usado para calcular o custo/hora."/>
                             <CostInput label="Horas de Trabalho/Dia" value={draft.personnel.workingHoursPerDay} onChange={v => handleFieldChange('personnel', 'workingHoursPerDay', v)} tooltip="Número de horas trabalhadas por dia. Essencial para o cálculo do custo/minuto."/>
                        </div>
                        <div className="mt-4">
                            <CostInput label="Encargos Sociais" type="percent" value={draft.personnel.socialCharges} onChange={v => handleFieldChange('personnel', 'socialCharges', v)} tooltip="Percentual de encargos (INSS, FGTS, etc.) sobre a folha de pagamento."/>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Salários Individuais (Opcional)</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {draft.personnel.employees.map(emp => (
                                    <div key={emp.id} className="grid grid-cols-2 gap-4 items-center">
                                        <span className="text-sm font-medium text-gray-700 truncate">{emp.name}</span>
                                        <input type="number" placeholder={draft.personnel.defaultBaseSalary.toFixed(2)} value={emp.salaryOverride ?? ''} onChange={e => handleEmployeeSalaryChange(emp.id, e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-sm"/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AccordionSection>

                     <AccordionSection title="Custos Operacionais" icon={<DollarIcon className="w-5 h-5 text-pink-500" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <CostInput label="Aluguel" type="currency" value={draft.operational.rent} onChange={v => handleFieldChange('operational', 'rent', v)} tooltip="Custo mensal do aluguel do espaço."/>
                           <CostInput label="Contas (Água, Luz, etc.)" type="currency" value={draft.operational.utilities} onChange={v => handleFieldChange('operational', 'utilities', v)} tooltip="Soma das despesas mensais com água, luz, internet, telefone, etc."/>
                           <CostInput label="Produtos (Estimativa)" type="currency" value={draft.operational.productsEstimate} onChange={v => handleFieldChange('operational', 'productsEstimate', v)} tooltip="Gasto fixo mensal com produtos de uso geral (não incluídos nas receitas de serviço)."/>
                           <CostInput label="Limpeza e Manutenção" type="currency" value={draft.operational.cleaningAndMaintenance} onChange={v => handleFieldChange('operational', 'cleaningAndMaintenance', v)} tooltip="Custo mensal com produtos e serviços de limpeza e manutenção predial."/>
                        </div>
                    </AccordionSection>

                    <AccordionSection title="Custos Administrativos" icon={<DollarIcon className="w-5 h-5 text-pink-500" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CostInput label="Marketing e Publicidade" type="currency" value={draft.administrative.marketing} onChange={v => handleFieldChange('administrative', 'marketing', v)} tooltip="Investimento mensal em anúncios, redes sociais, etc."/>
                            <CostInput label="Assessoria Contábil" type="currency" value={draft.administrative.accounting} onChange={v => handleFieldChange('administrative', 'accounting', v)} tooltip="Mensalidade do serviço de contabilidade."/>
                            <CostInput label="Sistemas e Software" type="currency" value={draft.administrative.software} onChange={v => handleFieldChange('administrative', 'software', v)} tooltip="Custo mensal com sistemas de agendamento, gestão, etc."/>
                            <CostInput label="Pró-labore" type="currency" value={draft.administrative.proLabore} onChange={v => handleFieldChange('administrative', 'proLabore', v)} tooltip="Remuneração definida para os sócios/donos do negócio."/>
                            <CostInput label="Depreciação" type="currency" value={draft.administrative.depreciation} onChange={v => handleFieldChange('administrative', 'depreciation', v)} tooltip="Valor mensal estimado para a desvalorização de equipamentos e móveis."/>
                            <CostInput label="Outras Despesas" type="currency" value={draft.administrative.other} onChange={v => handleFieldChange('administrative', 'other', v)} tooltip="Soma de outras despesas administrativas não listadas."/>
                        </div>
                    </AccordionSection>
                    
                     <AccordionSection title="Impostos e Taxas" icon={<DollarIcon className="w-5 h-5 text-pink-500" />}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <CostInput label="Impostos Fixos (mensal)" type="currency" value={draft.taxes.fixedTaxes} onChange={v => handleFieldChange('taxes', 'fixedTaxes', v)} tooltip="Soma de impostos fixos mensais (ex: IPTU, taxas)." />
                             <CostInput label="Taxa de Cartão" type="percent" value={draft.taxes.cardFee} onChange={v => handleFieldChange('taxes', 'cardFee', v)} tooltip="Taxa percentual média cobrada pelas operadoras de cartão." />
                             <CostInput label="Imposto s/ Serviço" type="percent" value={draft.taxes.serviceTax} onChange={v => handleFieldChange('taxes', 'serviceTax', v)} tooltip="Alíquota de imposto (ex: ISS) que incide sobre o valor do serviço." />
                        </div>
                    </AccordionSection>
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="sticky top-4">
                         <div className="p-4 rounded-lg bg-indigo-900/90 text-white shadow-lg">
                            <h3 className="text-lg font-semibold mb-3 border-b border-indigo-700 pb-2">Resumo de Custos</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="opacity-80">Custo Total / Mês</span><span className="font-bold">R$ {calculations.totalMonthlyCost.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="opacity-80">Custo / Hora</span><span className="font-bold">R$ {calculations.costPerHour.toFixed(2)}</span></div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-indigo-700"><span className="text-pink-300">Custo / Minuto</span><span className="text-pink-300">R$ {calculations.costPerMinute.toFixed(2)}</span></div>
                            </div>
                        </div>
                         <div className="p-4 mt-4 rounded-lg bg-white/80 border border-gray-200">
                             <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-pink-500" /> Distribuição de Custos</h3>
                             <CostPieChart data={chartData} />
                         </div>
                    </div>
                </div>
            </div>

            <SaveBar hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default CostConfigurationPanel;