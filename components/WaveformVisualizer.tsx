

import React, { useRef, useEffect } from 'react';

type Status = 'idle' | 'connecting' | 'listening' | 'error';

interface WaveformVisualizerProps {
    status: Status;
    isAiSpeaking: boolean;
    styleId: number;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ status, isAiSpeaking, styleId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let t = 0;
        
        const resizeCanvas = () => {
             const W = canvas.clientWidth;
             const H = canvas.clientHeight;
             if (canvas.width !== W * window.devicePixelRatio || canvas.height !== H * window.devicePixelRatio) {
                canvas.width = W * window.devicePixelRatio;
                canvas.height = H * window.devicePixelRatio;
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
             }
        };
        
        const getAmp = () => {
             let mainAmp = 0;
             const speaking = status === 'listening' && isAiSpeaking;
             switch(status) {
                case 'idle': mainAmp = 5; break;
                case 'connecting': mainAmp = 15 + Math.sin(t * 10) * 5; break;
                case 'listening': 
                    mainAmp = speaking 
                        ? 50 + Math.sin(t * 2) * 15  // AI Speaking: High amplitude
                        : 20 + Math.random() * 5;   // User Listening: Mid amplitude
                    break;
                case 'error': mainAmp = 10 + Math.sin(t * 20) * 5; break;
             }
             return mainAmp;
        };
        
        const render = () => {
            resizeCanvas();
            const W = canvas.clientWidth;
            const H = canvas.clientHeight;
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const baseAmp = getAmp();
            const centerY = H / 2;
            const centerX = W / 2;

            switch(styleId) {
                case 1: { // Wavy Lines
                    const drawWave = (color:string, freq: number, offset: number, lw: number, ampMod: number) => {
                        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
                        for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * freq + t + offset) * baseAmp * ampMod);
                        ctx.stroke();
                    };
                    drawWave('rgba(255, 255, 255, 0.7)', 0.02, 0, 1.5, 1);
                    drawWave('rgba(236, 72, 153, 0.8)', 0.015, Math.PI / 2, 1, 1.2);
                    break;
                }
                case 2: { // Symmetric Bars
                    const barCount = 32; const barWidth = W / barCount;
                    for (let i = 0; i < barCount; i++) {
                        const height = Math.abs(Math.sin(i * 0.5 + t) * baseAmp * 1.5);
                        const hue = (i * 10 + t * 50) % 360;
                        ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.7)`;
                        ctx.fillRect(i * barWidth + barWidth/4, centerY - height, barWidth / 2, height * 2);
                    }
                    break;
                }
                case 3: { // Spectrum
                     const barCount = 60; const barWidth = W / barCount;
                     for (let i = 0; i < barCount; i++) {
                        const height = (Math.sin(i * 0.4 + t) * Math.cos(i*0.1 + t*0.5) + 1) * baseAmp * 1.2;
                        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(236, 72, 153, 0.7)';
                        ctx.fillRect(i * barWidth, H - height, barWidth - 1, height);
                     }
                     break;
                }
                case 4: { // Pulsing Orb
                    const radius = baseAmp * 1.2 + Math.sin(t*2) * baseAmp * 0.3;
                    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                    gradient.addColorStop(0.7, 'rgba(236, 72, 153, 0.7)');
                    gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
                    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.fill();
                    break;
                }
                case 5: { // Particle Fountain
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    for (let i = 0; i < 50; i++) {
                        const angle = (Math.sin(i * 0.2 + t) + 1) * Math.PI / 2 + Math.PI / 4;
                        const dist = (1-((i * 20 + t * 50) % 100 / 100)) * H/2;
                        ctx.beginPath();
                        ctx.arc(centerX + Math.cos(angle) * dist * (i%2==0?1:-1), centerY - Math.sin(angle) * dist, 1.5, 0, Math.PI*2);
                        ctx.fill();
                    }
                    break;
                }
                case 6: { // Reflected Waves
                    const drawHalfWave = (offset: number, color: string) => {
                        ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath();
                        for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * 0.02 + t) * baseAmp * Math.cos(t + x * 0.005) * offset);
                        ctx.stroke();
                    };
                    drawHalfWave(1, 'rgba(255, 255, 255, 0.7)');
                    drawHalfWave(-1, 'rgba(236, 72, 153, 0.8)');
                    break;
                }
                case 7: { // Gradient Line
                    const gradient = ctx.createLinearGradient(0, 0, W, 0);
                    gradient.addColorStop(0, '#ec4899'); gradient.addColorStop(0.5, '#fff'); gradient.addColorStop(1, '#f472b6');
                    ctx.strokeStyle = gradient; ctx.lineWidth = 3; ctx.beginPath();
                    for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * 0.02 + t) * baseAmp);
                    ctx.stroke();
                    break;
                }
                case 8: { // Dotted Line
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    for (let x = 0; x <= W; x += 8) {
                        ctx.beginPath();
                        ctx.arc(x, centerY + Math.sin(x * 0.02 + t) * baseAmp, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;
                }
                case 9: { // Dual Waves
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.beginPath();
                    for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * 0.02 + t) * baseAmp);
                    ctx.stroke();
                    ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)'; ctx.beginPath();
                    for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * 0.03 + t + Math.PI) * baseAmp * 0.7);
                    ctx.stroke();
                    break;
                }
                case 10: { // Electric Arcs
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, centerY);
                    for (let x = 0; x <= W; x += 5) ctx.lineTo(x, centerY + Math.sin(x * 0.1 + t) * baseAmp/2 + (Math.random() - 0.5) * baseAmp);
                    ctx.stroke();
                    break;
                }
                default: { // Style 0: The complex default
                     const waves = [
                        { freq: 0.01, ampMod: 1.2, phase: 0, color: `hsla(330, 80%, 60%, 0.7)`, lineWidth: 2, },
                        { freq: 0.015, ampMod: 1, phase: 1.5, color: `hsla(290, 80%, 70%, 0.5)`, lineWidth: 1.5, },
                        { freq: 0.03, ampMod: 0.8, phase: 3, color: `hsla(340, 90%, 75%, 0.8)`, lineWidth: 1, },
                        { freq: 0.007, ampMod: 0.5, phase: 5, color: `hsla(300, 70%, 65%, 0.4)`, lineWidth: 3, }
                    ];
                    waves.forEach(wave => {
                        ctx.beginPath();
                        ctx.lineWidth = wave.lineWidth;
                        ctx.strokeStyle = wave.color;

                        for (let x = 0; x < W; x++) {
                            const sin1 = Math.sin(x * wave.freq + t + wave.phase);
                            const sin2 = Math.sin(x * wave.freq * 0.5 + t * 0.5 + wave.phase);
                            const y = centerY + (sin1 * sin2) * baseAmp * wave.ampMod;
                            ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                    });
                    break;
                }
            }
            
            animationFrameId = requestAnimationFrame(render);
        };
        
        render();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [status, isAiSpeaking, styleId]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />;
};

export default WaveformVisualizer;