import React, { useRef, useEffect } from 'react';

const drawPreviewFrame = (ctx: CanvasRenderingContext2D, styleId: number, W: number, H: number, t: number) => {
    ctx.clearRect(0, 0, W, H);
    const centerX = W / 2;
    const centerY = H / 2;
    const baseAmp = H / 4;
    const amp = baseAmp + Math.sin(t*2) * (baseAmp * 0.2);

    switch (styleId) {
        case 1: { // Wavy Lines
            const drawWave = (color:string, freq: number, offset: number, lw: number) => {
                ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
                for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * freq + t + offset) * amp * 0.8);
                ctx.stroke();
            };
            drawWave('rgba(255, 255, 255, 0.7)', 0.08, 0, 1.5);
            drawWave('rgba(236, 72, 153, 0.8)', 0.06, Math.PI / 2, 1);
            break;
        }
        case 2: { // Symmetric Bars
            const barCount = 12; const barWidth = W / barCount;
            for (let i = 0; i < barCount; i++) {
                const height = Math.abs(Math.sin(i * 0.5 + t) * (H * 0.4));
                const hue = (i * 20 + t * 50) % 360;
                ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.7)`;
                ctx.fillRect(i * barWidth + barWidth/4, centerY - height, barWidth / 2, height * 2);
            }
            break;
        }
        case 3: { // Spectrum
             const barCount = 20; const barWidth = W / barCount;
             for (let i = 0; i < barCount; i++) {
                const height = (Math.sin(i * 0.4 + t) * Math.cos(i*0.1 + t*0.5) + 1) * (H * 0.4);
                ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(236, 72, 153, 0.7)';
                ctx.fillRect(i * barWidth, H - height, barWidth - 1, height);
             }
             break;
        }
        case 4: { // Pulsing Orb
            const radius = H/4 + amp * 0.5;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.7, 'rgba(236, 72, 153, 0.7)');
            gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
            ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.fill();
            break;
        }
        case 5: { // Particle Fountain (simplified)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 20; i++) {
                const angle = Math.sin(i * 0.2 + t) * Math.PI / 1.5 - Math.PI / 4;
                const dist = (1 - ((i * 10 + t*30) % 100 / 100)) * H/1.5;
                ctx.beginPath();
                ctx.arc(centerX, H, 1.5, 0, Math.PI*2);
                ctx.translate(centerX, H);
                ctx.rotate(angle);
                ctx.fillRect(0, -dist, 2, 2);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
            break;
        }
        case 6: { // Reflected Waves
            const drawHalfWave = (offset: number, color: string) => {
                ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath();
                for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * 0.08 + t) * amp * Math.cos(t + x * 0.01) * offset);
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
            for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * 0.1 + t) * amp);
            ctx.stroke();
            break;
        }
        case 8: { // Dotted Line
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let x = 0; x <= W; x += 6) {
                ctx.beginPath();
                ctx.arc(x, centerY + Math.sin(x * 0.1 + t) * amp, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }
        case 9: { // Dual Waves
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.beginPath();
            for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * 0.08 + t) * amp);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)'; ctx.beginPath();
            for (let x = 0; x <= W; x++) ctx.lineTo(x, centerY + Math.sin(x * 0.1 + t + Math.PI) * amp * 0.7);
            ctx.stroke();
            break;
        }
        case 10: { // Electric Arcs
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, centerY);
            for (let x = 0; x <= W; x += 4) ctx.lineTo(x, centerY + Math.sin(x * 0.2 + t) * amp/2 + (Math.random() - 0.5) * amp * 0.8);
            ctx.stroke();
            break;
        }
        default: { // Style 0: Default complex style
             const waves = [
                { freq: 0.03, ampMod: 1.2, phase: 0, color: `hsla(330, 80%, 60%, 0.7)` },
                { freq: 0.05, ampMod: 0.8, phase: 3, color: `hsla(340, 90%, 75%, 0.8)` },
            ];
             waves.forEach(wave => {
                ctx.beginPath(); ctx.lineWidth = 1.5; ctx.strokeStyle = wave.color;
                for (let x = 0; x < W; x++) {
                    const sin1 = Math.sin(x * wave.freq + t + wave.phase);
                    const sin2 = Math.sin(x * wave.freq * 0.5 + t * 0.5 + wave.phase);
                    ctx.lineTo(x, centerY + (sin1 * sin2) * amp * wave.ampMod);
                }
                ctx.stroke();
            });
            break;
        }
    }
};

interface VisualizerPreviewProps {
    styleId: number;
    isSelected: boolean;
    onClick: () => void;
}

const VisualizerPreview: React.FC<VisualizerPreviewProps> = ({ styleId, isSelected, onClick }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;
        let t = Math.random() * 100;
        const render = () => {
            t += 0.02;
            drawPreviewFrame(ctx, styleId, canvas.width, canvas.height, t);
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [styleId]);

    return (
        <div onClick={onClick} className={`cursor-pointer rounded-lg overflow-hidden transition-all border-2 ${isSelected ? 'border-pink-500 scale-105 shadow-lg' : 'border-gray-300 hover:border-pink-400'}`}>
            <canvas ref={canvasRef} width="100" height="60" className="bg-gray-800/80 block"></canvas>
        </div>
    );
};

export default VisualizerPreview;