// Voice utilities for STT and TTS

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  isFinal: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'eclipse';
  text: string;
}

export const initSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  return recognition;
};

export const speak = (text: string, language: string = 'en-US'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window object not available'));
      return;
    }

    try {
      // Cancel any existing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = language; // Set language explicitly

      // Pick best available voice for the language
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.lang.startsWith(language.split('-')[0]) &&
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
      ) || voices.find(v => v.lang.startsWith(language.split('-')[0])) || voices[0];

      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('Speech synthesis failed'));

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
