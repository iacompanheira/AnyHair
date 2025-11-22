import React, { useState } from 'react';
import { UserIcon, PhoneIcon, MailIcon, KeyIcon, LockClosedIcon, EyeIcon, EyeOffIcon, CloseIcon } from './Icons';
import StopButton from './StopButton';
import StatusText from './StatusText';

type Status = 'idle' | 'connecting' | 'listening' | 'error';

interface AuthFormProps {
    onAuthSuccess: () => void;
    onClose: () => void;
    mode: 'login' | 'register';
    onModeChange: (mode: 'login' | 'register') => void;
    isVoiceSessionActive?: boolean;
    status?: Status;
    isAiSpeaking?: boolean;
    onStopListening?: () => void;
}

const AuthInput: React.FC<{
    id?: string;
    icon: React.ReactNode,
    type: string,
    placeholder: string,
    name: string;
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onToggleVisibility?: () => void,
    isPasswordVisible?: boolean
}> = ({ id, icon, type, placeholder, name, value, onChange, onToggleVisibility, isPasswordVisible }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
        </div>
        <input
            id={id}
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-lg placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        {onToggleVisibility && (
            <button
                type="button"
                onClick={onToggleVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            >
                {isPasswordVisible ? <EyeOffIcon className="h-5 w-5 text-white/70" /> : <EyeIcon className="h-5 w-5 text-white/70" />}
            </button>
        )}
    </div>
);

const AuthForm: React.FC<AuthFormProps> = ({ 
    onAuthSuccess, 
    onClose, 
    mode, 
    onModeChange,
    isVoiceSessionActive,
    status,
    isAiSpeaking,
    onStopListening
}) => {
    const [formState, setFormState] = useState({
        name: '', phone: '', email: '', cpf: '', password: '', confirmPassword: ''
    });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would add actual validation and API calls
        console.log("Submitting form:", { tab: mode, data: formState });
        onAuthSuccess();
    };

    // The form is placed at `bottom-16` (4rem from bottom), and `p-4` adds another 1rem of space below the form content.
    // Total space from viewport bottom to form content is 5rem.
    // Reducing internal paddings and margins to make it more compact.
    return (
        <div className="absolute bottom-16 left-0 right-0 z-20 p-4 bg-transparent animate-fade-in">
            <div className="w-full max-w-sm mx-auto bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 text-white/60 hover:text-white transition-colors" aria-label="Fechar">
                    <CloseIcon />
                </button>
                <div className="flex border-b border-white/20 mb-3">
                    <button
                        onClick={() => onModeChange('register')}
                        className={`flex-1 py-1.5 font-semibold text-lg transition-colors ${mode === 'register' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-white/70'}`}
                    >
                        Cadastrar
                    </button>
                    <button
                        onClick={() => onModeChange('login')}
                        className={`flex-1 py-1.5 font-semibold text-lg transition-colors ${mode === 'login' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-white/70'}`}
                    >
                        Entrar
                    </button>
                </div>
                
                {isVoiceSessionActive && onStopListening && status && (
                    <div className="flex flex-col items-center gap-1 my-2 animate-fade-in">
                        <StopButton onClick={onStopListening} className="w-10 h-10" />
                        <p className="text-white/90 text-sm font-semibold mt-1">Encerrar chamada</p>
                        <StatusText status={status} isAiSpeaking={isAiSpeaking!} size="small"/>
                    </div>
                )}


                <form onSubmit={handleSubmit} className="space-y-2">
                    {mode === 'register' ? (
                        <>
                            <p className="text-white/80 text-sm text-center pt-1 pb-1">
                                Complete seu cadastro para participar de sorteios e ter acesso a planos exclusivos!
                            </p>
                            <AuthInput id="register-name-input" icon={<UserIcon className="h-5 w-5 text-white/70" />} type="text" placeholder="Nome Completo" name="name" value={formState.name} onChange={handleChange} />
                            <AuthInput id="register-phone-input" icon={<PhoneIcon className="h-5 w-5 text-white/70" />} type="tel" placeholder="Telefone" name="phone" value={formState.phone} onChange={handleChange} />
                            <AuthInput id="register-email-input" icon={<MailIcon className="h-5 w-5 text-white/70" />} type="email" placeholder="E-mail (opcional)" name="email" value={formState.email} onChange={handleChange} />
                            <AuthInput id="register-cpf-input" icon={<KeyIcon className="h-5 w-5 text-white/70" />} type="text" placeholder="CPF (opcional)" name="cpf" value={formState.cpf} onChange={handleChange} />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <AuthInput id="register-password-input" icon={<LockClosedIcon className="h-5 w-5 text-white/70" />} type={passwordVisible ? 'text' : 'password'} placeholder="Senha" name="password" value={formState.password} onChange={handleChange} onToggleVisibility={() => setPasswordVisible(!passwordVisible)} isPasswordVisible={passwordVisible}/>
                                <AuthInput id="register-confirm-password-input" icon={<LockClosedIcon className="h-5 w-5 text-white/70" />} type={confirmPasswordVisible ? 'text' : 'password'} placeholder="Confirmar Senha" name="confirmPassword" value={formState.confirmPassword} onChange={handleChange} onToggleVisibility={() => setConfirmPasswordVisible(!confirmPasswordVisible)} isPasswordVisible={confirmPasswordVisible}/>
                            </div>
                            <button type="submit" className="w-full py-2 bg-pink-500 text-white font-bold text-lg rounded-lg hover:bg-pink-600 transition-colors shadow-lg">Criar Conta</button>
                        </>
                    ) : (
                        <>
                            <AuthInput id="login-email-input" icon={<MailIcon className="h-5 w-5 text-white/70" />} type="email" placeholder="E-mail" name="email" value={formState.email} onChange={handleChange} />
                            <AuthInput id="login-password-input" icon={<LockClosedIcon className="h-5 w-5 text-white/70" />} type={passwordVisible ? 'text' : 'password'} placeholder="Senha" name="password" value={formState.password} onChange={handleChange} onToggleVisibility={() => setPasswordVisible(!passwordVisible)} isPasswordVisible={passwordVisible}/>
                            <button type="submit" className="w-full py-2 bg-pink-500 text-white font-bold text-lg rounded-lg hover:bg-pink-600 transition-colors shadow-lg">Entrar</button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AuthForm;
