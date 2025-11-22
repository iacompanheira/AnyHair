import type { Service, Customer, Employee, SalonHoursSettings, DayHours, StandardHours } from '../types';
import { fromYYYYMMDD, formatFullDate } from './date';

export const formatServicesForPrompt = (services: Service[]): string => {
    if (services.length === 0) return "Nenhum serviço cadastrado.";
    const header = "LISTA DE SERVIÇOS, PREÇOS E DURAÇÕES ATUAIS:";
    const serviceLines = services.map(s =>
        `- ${s.name}: custa R$${s.price.toFixed(2).replace('.', ',')} e a duração é de ${s.duration} minutos.`
    );
    return `${header}\n${serviceLines.join('\n')}`;
};

export const formatCustomersForPrompt = (customers: Customer[]): string => {
    if (customers.length === 0) return "Nenhum cliente cadastrado.";
    const header = "INFORMAÇÕES DE CLIENTES CADASTRADOS:";
    const customerLines = customers.map(c => {
        let line = `- ${c.name}, telefone ${c.phone}.`;
        if (c.notes) line += ` Observações: ${c.notes}`;
        return line;
    });
    return `${header}\n${customerLines.join('\n')}`;
};

export const formatEmployeesForPrompt = (employees: Employee[]): string => {
    if (employees.length === 0) return "Nenhum funcionário cadastrado.";
    const header = "EQUIPE DE PROFISSIONAIS DISPONÍVEIS:";
    const employeeLines = employees
        .filter(e => e.status === 'Ativo' && e.accessLevel === 'Profissional')
        .map(e => {
            let line = `- ${e.name}`;
            if (e.specialty) {
                line += ` (${e.specialty})`;
            }
            return line;
        });

    if (employeeLines.length === 0) return "Nenhum profissional ativo cadastrado.";
    
    return `${header}\n${employeeLines.join('\n')}`;
};

export const formatSalonHoursForPrompt = (settings: SalonHoursSettings): string => {
    const formatScheduleText = (day: DayHours): string => {
        if (!day.enabled) return "Fechado.";
        let schedule = `Aberto das ${day.opens} às ${day.closes}.`;
        if (day.hasBreak && day.breakStarts && day.breakEnds) {
            schedule += ` Com intervalo para almoço das ${day.breakStarts} às ${day.breakEnds}.`;
        }
        return schedule;
    };

    const standard = settings.standardHours;
    const dayOrder: { key: keyof StandardHours; name: string }[] = [
        { key: 'monday', name: 'Segunda-feira' },
        { key: 'tuesday', name: 'Terça-feira' },
        { key: 'wednesday', name: 'Quarta-feira' },
        { key: 'thursday', name: 'Quinta-feira' },
        { key: 'friday', name: 'Sexta-feira' },
        { key: 'saturday', name: 'Sábado' },
        { key: 'sunday', name: 'Domingo' },
    ];

    const daySchedules = dayOrder.map(d => ({
        name: d.name,
        schedule: standard[d.key],
    }));

    let output = "HORÁRIO DE FUNCIONAMENTO PADRÃO:\n";

    if (daySchedules.length > 0) {
        const groups: { names: string[], schedule: DayHours }[] = [];
        let currentGroup = { names: [daySchedules[0].name], schedule: daySchedules[0].schedule };

        for (let i = 1; i < daySchedules.length; i++) {
            if (JSON.stringify(daySchedules[i].schedule) === JSON.stringify(currentGroup.schedule)) {
                currentGroup.names.push(daySchedules[i].name);
            } else {
                groups.push(currentGroup);
                currentGroup = { names: [daySchedules[i].name], schedule: daySchedules[i].schedule };
            }
        }
        groups.push(currentGroup);

        const getGroupName = (nameGroup: string[]): string => {
            if (nameGroup.length === 1) return nameGroup[0];
            if (nameGroup.length === 2) return `${nameGroup[0]} e ${nameGroup[1]}`;
            // Simple range for sequential days (e.g., "Terça a Sexta")
            const weekDays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
            const firstIndex = weekDays.indexOf(nameGroup[0]);
            const lastIndex = weekDays.indexOf(nameGroup[nameGroup.length - 1]);
            let isSequential = true;
            for (let i = 0; i < nameGroup.length; i++) {
                if(weekDays[firstIndex + i] !== nameGroup[i]) {
                    isSequential = false;
                    break;
                }
            }
            if(isSequential && nameGroup.length > 2) {
                 return `${nameGroup[0].replace('-feira', '')} a ${nameGroup[nameGroup.length - 1]}`;
            }

            // Fallback for non-sequential groups
            return nameGroup.join(', ');
        };

        groups.forEach(group => {
            const groupName = getGroupName(group.names);
            const scheduleText = formatScheduleText(group.schedule);
            output += `- ${groupName}: ${scheduleText}\n`;
        });
    }

    if (settings.exceptions.length > 0) {
        output += "\nEXCEÇÕES E FERIADOS:\n";
        const sortedExceptions = [...settings.exceptions].sort((a, b) => a.date.localeCompare(b.date));
        sortedExceptions.forEach(ex => {
            const date = formatFullDate(fromYYYYMMDD(ex.date));
            let line = `- ${date} (${ex.name}): `;
            if (ex.type === 'closed') {
                line += "Fechado.";
            } else {
                line += `Horário especial, aberto das ${ex.opens} às ${ex.closes}.`;
            }
            output += line + '\n';
        });
    }

    output += "\nREGRAS GERAIS DE AGENDAMENTO:\n";
    output += `- Agendamentos devem ser feitos com no mínimo ${settings.general.bookingLeadTime} horas de antecedência.\n`;
    if (settings.general.enableReminders) {
        output += `- Lembretes automáticos são enviados ${settings.general.reminderTime} horas antes do horário marcado.\n`;
    } else {
        output += `- Lembretes automáticos estão desativados.\n`;
    }

    return output.trim();
};