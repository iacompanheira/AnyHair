// components/ContactView.tsx
import React from 'react';
import { ArrowLeftIcon, PhoneIcon, MailIcon, MapPinIcon } from './Icons';

const ContactView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800 p-4 sm:p-8">
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Contato e Localização</h3>
            </header>
            <div className="flex-grow overflow-y-auto pr-2 pb-4 space-y-6">
                <div className="bg-white/80 border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700">Informações de Contato</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <PhoneIcon className="w-6 h-6 text-pink-500" />
                            <div>
                                <p className="font-semibold">Telefone / WhatsApp</p>
                                <p className="text-gray-600">(11) 91234-5678</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <MailIcon className="w-6 h-6 text-pink-500" />
                            <div>
                                <p className="font-semibold">E-mail</p>
                                <p className="text-gray-600">contato@anyhair.com</p>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="bg-white/80 border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700">Nosso Endereço</h4>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4">
                            <MapPinIcon className="w-6 h-6 text-pink-500" />
                            <div>
                                <p className="font-semibold">AnyHair Salon</p>
                                <p className="text-gray-600">Rua da Beleza, 123 - Centro<br/>São Paulo, SP - 01000-000</p>
                            </div>
                        </div>
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                           {/* Placeholder for a map */}
                           <img src="https://i.imgur.com/3ZgQH8A.png" alt="Mapa da localização" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ContactView;