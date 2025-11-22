// utils/uiController.ts

/**
 * Highlights a UI element by adding a temporary glowing animation class.
 * @param elementId The ID of the element to highlight.
 * @param duration The duration of the highlight in milliseconds.
 * @returns A promise that resolves when the highlight is complete.
 */
export const highlightElement = (elementId: string, duration: number = 2000): Promise<string> => {
    return new Promise((resolve) => {
        const element = document.getElementById(elementId);
        if (element) {
            // The animation class 'animate-glow-once' is defined in index.html
            element.classList.add('animate-glow-once');
            setTimeout(() => {
                element.classList.remove('animate-glow-once');
                resolve(`Element '${elementId}' highlighted successfully.`);
            }, duration);
        } else {
            resolve(`Error: Element with ID '${elementId}' not found.`);
        }
    });
};

/**
 * Simulates a click on a UI element.
 * @param elementId The ID of the element to click.
 * @returns A success or error message.
 */
export const clickElement = (elementId: string): string => {
    const element = document.getElementById(elementId) as HTMLElement;
    if (element) {
        element.click();
        return `Element '${elementId}' clicked successfully.`;
    } else {
        return `Error: Element with ID '${elementId}' not found.`;
    }
};

/**
 * Scrolls a container or the window.
 * @param elementId The ID of the element to scroll. Use 'window' for the main page.
 * @param direction Where to scroll.
 * @param amount How much to scroll in pixels (for 'up' and 'down').
 * @returns A success or error message.
 */
export const scrollElement = (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom', amount: number = 300): string => {
    const isWindow = elementId.toLowerCase() === 'window' || elementId === '';
    const element = isWindow ? window : document.getElementById(elementId);

    if (element) {
        const target = isWindow ? document.documentElement : (element as HTMLElement);
        
        let top;
        switch(direction) {
            case 'up':
                top = target.scrollTop - amount;
                break;
            case 'down':
                top = target.scrollTop + amount;
                break;
            case 'top':
                 top = 0;
                 break;
            case 'bottom':
                 top = target.scrollHeight;
                 break;
        }
        
        element.scrollTo({
            top,
            behavior: 'smooth'
        });
        
        return `Scrolled element '${elementId}' ${direction}.`;
    } else {
         return `Error: Scrollable element with ID '${elementId}' not found.`;
    }
};


/**
 * Types text into an input or textarea field.
 * @param elementId The ID of the input element.
 * @param text The text to type.
 * @returns A success or error message.
 */
export const typeText = (elementId: string, text: string): string => {
    const element = document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement;
    if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
        element.value = text;
        // Dispatch an input event to ensure React state updates if the input is controlled
        const event = new Event('input', { bubbles: true });
        element.dispatchEvent(event);
        return `Typed '${text}' into element '${elementId}'.`;
    } else {
        return `Error: Input element with ID '${elementId}' not found.`;
    }
};
