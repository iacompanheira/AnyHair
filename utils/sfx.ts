// A simple sound effects player using the Web Audio API.
// It generates sounds programmatically, so no audio files are needed.

let sfxContext: AudioContext | null = null;

const getSfxContext = (): AudioContext => {
  if (!sfxContext || sfxContext.state === 'closed') {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    sfxContext = new AudioContext();
  }
  return sfxContext;
};

const playSound = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.5
) => {
  try {
    const context = getSfxContext();
    if (context.state === 'suspended') {
      context.resume();
    }
    
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  } catch (e) {
    console.error("Could not play sound effect:", e);
  }
};

/** Plays a short, sharp click sound. */
export const playClickSound = () => {
  playSound(2200, 0.05, 'triangle', 0.1);
};
