// components/dashboard/finance/hooks/useFinancialData.ts
import { useMemo } from 'react';
import type { Appointment, Transaction, CostSettings } from '../../../../types';

export interface Period {
    startDate: Date;
    endDate: Date;
    label: string;
}

const expenseColors = ["#EC4899", "#F59E0B", "#8B5CF6", "#10B981", "#3B82F6", "#6366F1", "#D946EF", "#F97316"];

const getCategoryColor = (category: string, index: number) => {
    const categoryMap: { [key: string]: string } = {
        'Pessoal': '#4F46E5',
        'Aluguel': '#EC4899',
        'Contas': '#F59E0B',
        'Produtos': '#10B981',
        'Marketing': '#8B5CF6',
        'Impostos': '#EF4444'
    };
    return categoryMap[category] || expenseColors[index % expenseColors.length];
};

export const useFinancialData = (startDate: Date, endDate: Date, allAppointments: Appointment[], allTransactions: Transaction[], costSettings: CostSettings) => {

    const allEvents = useMemo(() => {
        const appointmentIncomes = allAppointments
            .filter(a => a.status === 'Concluído' && a.paymentStatus === 'Pago')
            .map(a => ({
                id: `apt-${a.id}`,
                date: new Date(a.date).toISOString(),
                description: `Serviço: ${a.serviceName} (${a.customerName})`,
                type: 'income',
                amount: a.price,
                category: 'Serviços',
                canBeDeleted: false
            } as Transaction));
        
        return [...allTransactions, ...appointmentIncomes];

    }, [allAppointments, allTransactions]);

    const periodData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const periodLength = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        const prevEndDate = new Date(start);
        prevEndDate.setDate(start.getDate() - 1);
        const prevStartDate = new Date(prevEndDate);
        prevStartDate.setDate(prevEndDate.getDate() - (periodLength -1));

        const filterEventsByPeriod = (events: Transaction[], start: Date, end: Date) => {
            return events.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate >= start && eventDate <= end;
            });
        };
        
        const currentPeriodEvents = filterEventsByPeriod(allEvents, start, end);
        const previousPeriodEvents = filterEventsByPeriod(allEvents, prevStartDate, prevEndDate);
        
        const calculateKpis = (events: Transaction[]) => {
            const faturamento = events.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
            const despesas = events.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
            const lucro = faturamento - despesas;
            return { faturamento, despesas, lucro };
        };

        const kpis = calculateKpis(currentPeriodEvents);
        const previousKpis = calculateKpis(previousPeriodEvents);

        const personnelCost = costSettings.personnel.employees.reduce((sum, emp) => sum + (emp.salaryOverride ?? costSettings.personnel.defaultBaseSalary), 0) * (1 + costSettings.personnel.socialCharges / 100);
        const operationalCost = Object.values(costSettings.operational).reduce((sum, val) => sum + Number(val), 0);
        const administrativeCost = Object.values(costSettings.administrative).reduce((sum, val) => sum + Number(val), 0);
        const fixedTaxes = costSettings.taxes.fixedTaxes;
        const pontoDeEquilibrio = personnelCost + operationalCost + administrativeCost + fixedTaxes;
        
        // Cash Flow Data
        const cashFlowMap = new Map<string, { income: number, expense: number }>();
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = new Date(d).toISOString().split('T')[0];
            cashFlowMap.set(dateStr, { income: 0, expense: 0 });
        }
        currentPeriodEvents.forEach(e => {
            const dateStr = new Date(e.date).toISOString().split('T')[0];
            const day = cashFlowMap.get(dateStr);
            if (day) {
                if (e.type === 'income') day.income += e.amount;
                else day.expense += e.amount;
            }
        });
        
        let balance = 0;
        const cashFlowData = Array.from(cashFlowMap.entries()).map(([date, values]) => {
            balance += values.income - values.expense;
            return { date, ...values, balance };
        });

        // Expense Category Data
        const expenseCategoryMap = new Map<string, number>();
        currentPeriodEvents.filter(e => e.type === 'expense').forEach(e => {
            const category = e.category || 'Outros';
            expenseCategoryMap.set(category, (expenseCategoryMap.get(category) || 0) + e.amount);
        });

        const expenseCategoryData = Array.from(expenseCategoryMap.entries())
            .map(([category, amount], index) => ({ category, amount, color: getCategoryColor(category, index) }))
            .sort((a,b) => b.amount - a.amount);
        
        return {
            allPeriodEvents: currentPeriodEvents,
            kpis: { ...kpis, pontoDeEquilibrio },
            previousKpis,
            cashFlowData,
            expenseCategoryData,
        };
        
    }, [startDate, endDate, allEvents, costSettings]);

    return periodData;
};
