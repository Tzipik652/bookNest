import { useEffect, useRef } from "react";
import { useAccessibilityStore } from "../store/accessibilityStore";

export function useScreenReader() {
  const { screenReader } = useAccessibilityStore();
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Detect Hebrew/English
  const detectLang = (text: string) =>
    /[\u0590-\u05FF]/.test(text) ? "he-IL" : "en-US";

  // Stop reading
  const stop = () => {
    speechSynthesis.cancel();
    utterRef.current = null;
  };

  // Speak text
  const speak = (text: string) => {
    if (!screenReader || !text.trim()) return;

    stop();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = detectLang(text);
    u.rate = 1;
    u.pitch = 1;

    utterRef.current = u;
    speechSynthesis.speak(u);
  };

  // Detect hidden
  const isHidden = (el: HTMLElement): boolean => {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return true;
    if (!el.offsetParent && style.position !== "fixed") return true;
    return false;
  };

  // Extract readable label (MUI-safe)
  const getLabel = (el: HTMLElement): string => {
    if (!el || el.hasAttribute("data-skip-sr") || isHidden(el)) return "";

    // Prefer aria-label
    const aria = el.getAttribute("aria-label");
    if (aria) return aria;

    // For MUI TextField / Input
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return el.placeholder || el.value || "";
    }

    // For images
    if (el instanceof HTMLImageElement && el.alt) return el.alt;

    // Title attribute (for icons)
    if (el.title) return el.title;

    // Normal text
    let txt = el.textContent?.trim();
    if (txt) return txt;

    // Try children
    for (const child of Array.from(el.children)) {
      const cText = child.textContent?.trim();
      if (cText) return cText;
    }

    // Retry upwards (important for MUI nested wrappers)
    let parent: HTMLElement | null = el.parentElement;
    while (parent && parent !== document.body) {
      const pText = parent.textContent?.trim();
      if (pText) return pText;
      parent = parent.parentElement;
    }

    return "";
  };

  // Make readable elements focusable
  const makeFocusable = () => {
    const selectors = `
      h1, h2, h3, h4, h5, h6,
      p, li,
      button, a, input, textarea, select,
      img,
      [role="button"], [role="menuitem"], [role="tab"], [aria-label]
    `;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));

    elements.forEach((el) => {
      const text = getLabel(el);
      if (text && !el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "0");
      }
    });
  };

  // Auto-stop when menus/dialogs close
  useEffect(() => {
    if (!screenReader) return;

    const observer = new MutationObserver(() => {
      const openMenus = document.querySelectorAll('[role="menu"]:not([style*="display: none"])');
      const openDialogs = document.querySelectorAll('[role="dialog"]:not([style*="display: none"])');
      const openPopovers = document.querySelectorAll('[role="tooltip"]:not([style*="display: none"])');

      if (openMenus.length === 0 && openDialogs.length === 0 && openPopovers.length === 0) {
        stop();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"]
    });

    return () => observer.disconnect();
  }, [screenReader]);

  // Main activation logic
  useEffect(() => {
    if (!screenReader) {
      stop();
      return;
    }

    makeFocusable();

    const handleFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (!el) return;

      // Find readable parent for MUI elements (buttons, IconButtons, TextField wrappers)
      let readableEl: HTMLElement = el;
      const parent = el.closest(
        "button, [role='button'], [aria-label], input, textarea, select"
      );
      if (parent && parent instanceof HTMLElement) readableEl = parent;

      speak(getLabel(readableEl));
    };

    const stopEvents = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") stop();
      if (e instanceof MouseEvent) stop();
    };

    document.addEventListener("focusin", handleFocus, true);
    document.addEventListener("keydown", stopEvents, true);
    document.addEventListener("mousedown", stopEvents, true);
    document.addEventListener("mouseover", handleFocus, true); // optional: hover reading

    return () => {
      document.removeEventListener("focusin", handleFocus, true);
      document.removeEventListener("keydown", stopEvents, true);
      document.removeEventListener("mousedown", stopEvents, true);
      document.removeEventListener("mouseover", handleFocus, true);
      stop();
    };
  }, [screenReader]);

  return { stop };
}
