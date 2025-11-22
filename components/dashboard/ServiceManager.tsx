

import React from 'react';
import type { Service, Combo } from '../../types';
import { ArrowLeftIcon } from './Icons';


interface ServiceManagerProps {
    services: Service[];
    combos: Combo[];
    onBack: () => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ services, combos, onBack }) => {

    const servicesMap = new Map(services.map(s => [s.id, s]));

    return (
         <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800">
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Catálogo de Serviços e Pacotes</h3>
            </header>
            <div className="flex-grow overflow-y-auto pr-2 pb-24 space-y-6">
                
                {/* Individual Services Section */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Serviços Individuais</h4>
                    <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                        <ul className="divide-y divide-gray-200">
                            {services.map(service => (
                                <li key={service.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{service.name}</p>
                                        <p className="text-sm text-gray-500">R$ {service.price.toFixed(2).replace('.', ',')} - {service.duration} min</p>
                                    </div>
                                    {/* Read-only, no buttons */}
                                </li>
                            ))}
                            {services.length === 0 && <li className="p-8 text-center text-gray-500">Nenhum serviço individual cadastrado.</li>}
                        </ul>
                    </div>
                </div>

                {/* Combos & Packages Section */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Combos & Pacotes</h4>
                     <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm">
                        <ul className="divide-y divide-gray-200">
                            {combos.map(combo => {
                                const includedServices = combo.serviceIds.map(id => servicesMap.get(id)).filter(Boolean) as Service[];
                                const totalDuration = includedServices.reduce((sum, s) => sum + s.duration, 0);
                                const originalPrice = combo.originalPrice || includedServices.reduce((sum, s) => sum + s.price, 0);

                                return (
                                     <li key={combo.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800">{combo.name}</p>
                                                <div className="flex items-baseline gap-2 mt-1">
                                                    <p className="text-lg font-bold text-pink-600">R$ {combo.finalPrice.toFixed(2).replace('.', ',')}</p>
                                                    {originalPrice > combo.finalPrice && (
                                                        <p className="text-sm text-gray-500 line-through">R$ {originalPrice.toFixed(2).replace('.', ',')}</p>
                                                    )}
                                                     <p className="text-sm text-gray-500">- {totalDuration} min</p>
                                                </div>
                                            </div>
                                            {/* Read-only, no buttons */}
                                        </div>
                                        <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">SERVIÇOS INCLUSOS:</p>
                                            <ul className="list-disc list-inside text-sm text-gray-600">
                                                {includedServices.map(s => <li key={s.id}>{s.name}</li>)}
                                            </ul>
                                        </div>
                                    </li>
                                );
                            })}
                            {combos.length === 0 && <li className="p-8 text-center text-gray-500">Nenhum pacote cadastrado.</li>}
                        </ul>
                    </div>
                </div>

            </div>
            {/* No SaveBar needed */}
        </div>
    );
};

export default ServiceManager;