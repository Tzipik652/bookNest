import { create } from 'zustand';

interface AccessibilityState {
  darkMode: boolean;
  highContrast: boolean;
  largeText: boolean;
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set) => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('accessibility') : null;
  const initial = saved ? JSON.parse(saved) : { darkMode: false, highContrast: false, largeText: false };

  return {
    darkMode: initial.darkMode,
    highContrast: initial.highContrast,
    largeText: initial.largeText,

    toggleDarkMode: () => set((state) => {
      const newState = { darkMode: !state.darkMode };
      localStorage.setItem('accessibility', JSON.stringify({ ...state, ...newState }));
      return newState;
    }),
    toggleHighContrast: () => set((state) => {
      const newState = { highContrast: !state.highContrast };
      localStorage.setItem('accessibility', JSON.stringify({ ...state, ...newState }));
      return newState;
    }),
    toggleLargeText: () => set((state) => {
      const newState = { largeText: !state.largeText };
      localStorage.setItem('accessibility', JSON.stringify({ ...state, ...newState }));
      return newState;
    }),
  };
});
