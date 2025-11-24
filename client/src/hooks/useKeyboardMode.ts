import { useEffect, useState } from 'react';

/**
 * Hook שמזהה אם המשתמש משתמש במקלדת או בעכבר
 * זה עוזר להציג רק את סגנונות הפוקוס הרלוונטיים
 */
export function useKeyboardMode() {
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  useEffect(() => {
    let keyboardModeTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // רק מקשים שמשמשים לניווט
      const navigationKeys = [
        'Tab',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Enter',
        ' ', // Space
        'Home',
        'End',
        'PageUp',
        'PageDown'
      ];

      if (navigationKeys.includes(e.key)) {
        setIsKeyboardMode(true);
        
        // איפוס הטיימר כל פעם שיש הקשה
        clearTimeout(keyboardModeTimeout);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardMode(false);
      
      // נשאיר את מצב העכבר למשך 3 שניות
      clearTimeout(keyboardModeTimeout);
      keyboardModeTimeout = setTimeout(() => {
        setIsKeyboardMode(true);
      }, 3000);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      clearTimeout(keyboardModeTimeout);
    };
  }, []);

  return isKeyboardMode;
}

/**
 * Hook שמוסיף class לגוף הדף בהתאם למצב הניווט
 * זה מאפשר לנו לשלוט ב-CSS באופן גלובלי
 */
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

/**
 * Hook למעקב אחרי הקשה ספציפית
 */
export function useKeyPress(targetKey: string, callback: () => void, deps: any[] = []) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === targetKey) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [targetKey, ...deps]);
}

/**
 * Hook לטיפול בקיצורי מקלדת עם modifiers
 */
export function useHotkey(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  } = {}
) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = options.ctrl ? e.ctrlKey : !e.ctrlKey;
      const matchesShift = options.shift ? e.shiftKey : !e.shiftKey;
      const matchesAlt = options.alt ? e.altKey : !e.altKey;
      const matchesMeta = options.meta ? e.metaKey : !e.metaKey;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [key, callback, options.ctrl, options.shift, options.alt, options.meta]);
}