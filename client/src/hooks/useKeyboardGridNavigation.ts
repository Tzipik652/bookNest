import { useEffect, useRef, useState, useCallback } from 'react';

interface UseKeyboardGridNavigationProps<T> {
  items: T[];
  getId: (item: T) => string;
  onEnter?: (item: T) => void;
  columnsPerRow?: number;
  enableArrowKeys?: boolean;
}

export function useKeyboardGridNavigation<T>({
  items,
  getId,
  onEnter,
  columnsPerRow = 4,
  enableArrowKeys = true
}: UseKeyboardGridNavigationProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  // פונקציה לחישוב כמות העמודות האמיתית (responsive)
  const getActualColumns = useCallback(() => {
    if (!gridRef.current) return columnsPerRow;
    
    const gridWidth = gridRef.current.offsetWidth;
    const firstItem = itemRefs.current.get(0);
    
    if (!firstItem) return columnsPerRow;
    
    const itemWidth = firstItem.offsetWidth;
    const gap = 24; // התאם לפי ה-gap שלך
    
    return Math.floor((gridWidth + gap) / (itemWidth + gap));
  }, [columnsPerRow]);

  // פוקוס על אלמנט
  const focusItem = useCallback((index: number) => {
    if (index < 0 || index >= items.length) return;
    
    const element = itemRefs.current.get(index);
    if (element) {
      element.focus();
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [items.length]);

  // טיפול באירועי מקלדת על פריט בודד
  const handleItemKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (!enableArrowKeys) return;

    const cols = getActualColumns();
    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(index + 1, items.length - 1);
        break;
      
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(index - 1, 0);
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(index + cols, items.length - 1);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(index - cols, 0);
        break;
      
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onEnter && items[index]) {
          onEnter(items[index]);
        }
        return;
      
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      
      default:
        return;
    }

    setFocusedIndex(newIndex);
    focusItem(newIndex);
  }, [items, enableArrowKeys, onEnter, getActualColumns, focusItem]);

  // רישום אלמנטים
  const registerItem = useCallback((index: number, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(index, element);
    } else {
      itemRefs.current.delete(index);
    }
  }, []);

  // פוקוס ראשוני אם יש פריטים
  useEffect(() => {
    if (items.length > 0 && focusedIndex === -1) {
      setFocusedIndex(0);
    }
  }, [items.length, focusedIndex]);

  // ניקוי
  useEffect(() => {
    return () => {
      itemRefs.current.clear();
    };
  }, []);

  return {
    gridRef,
    focusedIndex,
    setFocusedIndex,
    handleItemKeyDown,
    registerItem,
    focusItem
  };
}