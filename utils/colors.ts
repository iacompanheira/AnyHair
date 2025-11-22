
export const darken = (hex: string, amount: number): string => {
    let color = hex.startsWith('#') ? hex.slice(1) : hex;
    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }

    const num = parseInt(color, 16);
    let r = (num >> 16);
    let g = (num >> 8) & 0x00FF;
    let b = num & 0x0000FF;

    r = Math.max(0, Math.min(255, r - amount)); // Note: Fixed logic to subtract for darkening
    g = Math.max(0, Math.min(255, g - amount));
    b = Math.max(0, Math.min(255, b - amount));
    
    const toHex = (c: number) => c.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const hexToRgba = (hex: string, alpha: number): string => {
    const hexValue = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(hexValue.substring(0, 2), 16);
    const g = parseInt(hexValue.substring(2, 4), 16);
    const b = parseInt(hexValue.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
