import { create } from "zustand";

interface AccessibilityState {
  menuOpen: boolean;
  darkMode: boolean;
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  underlineLinks: boolean;
  dyslexicFont: boolean;
  screenReader: boolean;

  toggleMenu: () => void;
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReduceMotion: () => void;
  toggleUnderlineLinks: () => void;
  toggleDyslexicFont: () => void;
  toggleScreenReader: () => void;
}


export const useAccessibilityStore = create<AccessibilityState>((set, get) => {
  const saved =
    typeof window !== "undefined"
      ? localStorage.getItem("accessibility")
      : null;

  const initial = saved
    ? JSON.parse(saved)
    : {
        menuOpen: false,
        darkMode: false,
        highContrast: false,
        largeText: false,
        reduceMotion: false,
        underlineLinks: false,
        dyslexicFont: false,
        screenReader: false,
      };

  const save = (newState: Partial<AccessibilityState>) => {
    const full = { ...get(), ...newState };
    localStorage.setItem("accessibility", JSON.stringify(full));
  };

  return {
    ...initial,

    toggleMenu: () =>
      set((state) => {
        const newState = { menuOpen: !state.menuOpen };
        save(newState);
        return newState;
      }),

    toggleDarkMode: () =>
      set((state) => {
        const newState = { darkMode: !state.darkMode };
        save(newState);
        return newState;
      }),

    toggleHighContrast: () =>
      set((state) => {
        const newState = { highContrast: !state.highContrast };
        save(newState);
        return newState;
      }),

    toggleLargeText: () =>
      set((state) => {
        const newState = { largeText: !state.largeText };
        save(newState);
        return newState;
      }),

    toggleReduceMotion: () =>
      set((state) => {
        const newState = { reduceMotion: !state.reduceMotion };
        save(newState);
        return newState;
      }),

    toggleUnderlineLinks: () =>
      set((state) => {
        const newState = { underlineLinks: !state.underlineLinks };
        save(newState);
        return newState;
      }),

    toggleDyslexicFont: () =>
      set((state) => {
        const newState = { dyslexicFont: !state.dyslexicFont };
        save(newState);
        return newState;
      }),

    toggleScreenReader: () =>
      set((state) => {
        const newState = { screenReader: !state.screenReader };
        save(newState);
        return newState;
      }),
  };
});
