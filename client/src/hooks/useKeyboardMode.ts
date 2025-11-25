// //use keyboard mode hook
// import { useEffect, useState } from 'react';

// /**
//  * Hook שמזהה אם המשתמש משתמש במקלדת או בעכבר
//  * זה עוזר להציג רק את סגנונות הפוקוס הרלוונטיים
//  */
// export function useKeyboardMode() {
//   const [isKeyboardMode, setIsKeyboardMode] = useState(false);

//   useEffect(() => {
//     let keyboardModeTimeout: NodeJS.Timeout;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       // רק מקשים שמשמשים לניווט
//       const navigationKeys = [
//         'Tab',
//         'ArrowUp',
//         'ArrowDown',
//         'ArrowLeft',
//         'ArrowRight',
//         'Enter',
//         ' ', // Space
//         'Home',
//         'End',
//         'PageUp',
//         'PageDown'
//       ];

//       if (navigationKeys.includes(e.key)) {
//         setIsKeyboardMode(true);
        
//         // איפוס הטיימר כל פעם שיש הקשה
//         clearTimeout(keyboardModeTimeout);
//       }
//     };

//     const handleMouseDown = () => {
//       setIsKeyboardMode(false);
      
//       // נשאיר את מצב העכבר למשך 3 שניות
//       clearTimeout(keyboardModeTimeout);
//       keyboardModeTimeout = setTimeout(() => {
//         setIsKeyboardMode(true);
//       }, 3000);
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('mousedown', handleMouseDown);

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('mousedown', handleMouseDown);
//       clearTimeout(keyboardModeTimeout);
//     };
//   }, []);

//   return isKeyboardMode;
// }

// /**
//  * Hook שמוסיף class לגוף הדף בהתאם למצב הניווט
//  * זה מאפשר לנו לשלוט ב-CSS באופן גלובלי
//  */
// export function useKeyboardModeBodyClass() {
//   const isKeyboardMode = useKeyboardMode();

//   useEffect(() => {
//     if (isKeyboardMode) {
//       document.body.classList.add('keyboard-mode');
//       document.body.classList.remove('mouse-mode');
//     } else {
//       document.body.classList.add('mouse-mode');
//       document.body.classList.remove('keyboard-mode');
//     }
//   }, [isKeyboardMode]);

//   return isKeyboardMode;
// }

// /**
//  * Hook למעקב אחרי הקשה ספציפית
//  */
// export function useKeyPress(targetKey: string, callback: () => void, deps: any[] = []) {
//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.key === targetKey) {
//         callback();
//       }
//     };

//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [targetKey, ...deps]);
// }

// /**
//  * Hook לטיפול בקיצורי מקלדת עם modifiers
//  */
// export function useHotkey(
//   key: string,
//   callback: () => void,
//   options: {
//     ctrl?: boolean;
//     shift?: boolean;
//     alt?: boolean;
//     meta?: boolean;
//   } = {}
// ) {
//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       const matchesKey = e.key.toLowerCase() === key.toLowerCase();
//       const matchesCtrl = options.ctrl ? e.ctrlKey : !e.ctrlKey;
//       const matchesShift = options.shift ? e.shiftKey : !e.shiftKey;
//       const matchesAlt = options.alt ? e.altKey : !e.altKey;
//       const matchesMeta = options.meta ? e.metaKey : !e.metaKey;

//       if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
//         e.preventDefault();
//         callback();
//       }
//     };

//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [key, callback, options.ctrl, options.shift, options.alt, options.meta]);
// }

import { useEffect, useState } from 'react';

/**
 * זיהוי מצב מקלדת מול עכבר
 */
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

/**
 * ניהול class על body — global CSS mode
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
 * KeyPress פשוט (ללא חזרתיות)
 */
export function useKeyPress(targetKey: string, callback: () => void, deps: any[] = []) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        const isEditable =
          tag === 'INPUT' || tag === 'TEXTAREA' || active.getAttribute('contenteditable') === 'true';
        if (isEditable) return; // אל נפעיל קיצורים כשכותבים בקלט
      }

      if (e.key === targetKey || e.code === targetKey) {
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [targetKey, callback, ...deps]);
}


/**
 * Hotkey עם modifiers — גרסה מדויקת שלא תופסת מקשים לא מכוונים
 */
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
