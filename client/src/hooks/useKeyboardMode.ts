import { useEffect, useState } from 'react';

export function useKeyboardMode() {
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  useEffect(() => {
    let revertTimer: NodeJS.Timeout | null = null;

    const navigationKeys = new Set([
      'Tab',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Enter',
      ' ',
      'Home',
      'End',
      'PageUp',
      'PageDown'
    ]);

    const onKey = (e: KeyboardEvent) => {
      if (navigationKeys.has(e.key)) {
        setIsKeyboardMode(true);
        if (revertTimer) clearTimeout(revertTimer);
      }
    };

    const onMouse = () => {
      setIsKeyboardMode(false);

      if (revertTimer) clearTimeout(revertTimer);
      revertTimer = setTimeout(() => {
        setIsKeyboardMode(true);
      }, 3000);
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onMouse);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onMouse);
      if (revertTimer) clearTimeout(revertTimer);
    };
  }, []);

  return isKeyboardMode;
}

export function useKeyboardModeBodyClass() {
  const isKeyboardMode = useKeyboardMode();

  useEffect(() => {
    if (isKeyboardMode) {
      document.body.classList.add('keyboard-mode');
      document.body.classList.remove('mouse-mode');
    } else {
      document.body.classList.add('mouse-mode');
      document.body.classList.remove('keyboard-mode');
    }
  }, [isKeyboardMode]);

  return isKeyboardMode;
}

export function useKeyPress(targetKey: string, callback: () => void, deps: any[] = []) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        const isEditable =
          tag === 'INPUT' || tag === 'TEXTAREA' || active.getAttribute('contenteditable') === 'true';
        if (isEditable) return;
      }

      if (e.key === targetKey || e.code === targetKey) {
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [targetKey, callback, ...deps]);
}

export function useHotkey(
  key: string,
  callback: () => void,
  options: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      if (options.ctrl && !e.ctrlKey) return;
      if (!options.ctrl && e.ctrlKey) return;

      if (options.shift && !e.shiftKey) return;
      if (!options.shift && e.shiftKey) return;

      if (options.alt && !e.altKey) return;
      if (!options.alt && e.altKey) return;

      if (options.meta && !e.metaKey) return;
      if (!options.meta && e.metaKey) return;

      e.preventDefault();
      callback();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options.ctrl, options.shift, options.alt, options.meta]);
}
