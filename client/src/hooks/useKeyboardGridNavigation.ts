// import { useEffect, useRef, useState, useCallback } from 'react';

// interface UseKeyboardGridNavigationProps<T> {
//   items: T[];
//   getId: (item: T) => string;
//   onEnter?: (item: T) => void;
//   enableArrowKeys?: boolean;
// }

// export function useKeyboardGridNavigation<T>({
//   items,
//   getId,
//   onEnter,
//   enableArrowKeys = true,
// }: UseKeyboardGridNavigationProps<T>) {
//   const [focusedIndex, setFocusedIndex] = useState<number>(-1);
//   const gridRef = useRef<HTMLDivElement | null>(null);
//   const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

//   // ---------------------------
//   // Focus item
//   // ---------------------------
//   const focusItem = useCallback((index: number) => {
//     const el = itemRefs.current.get(index);
//     if (!el) return;
//     el.focus({ preventScroll: true });
//     el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
//   }, []);

//   // ---------------------------
//   // Register item
//   // ---------------------------
//   const registerItem = useCallback((index: number, el: HTMLElement | null) => {
//     if (el) itemRefs.current.set(index, el);
//     else itemRefs.current.delete(index);
//   }, []);

//   // ---------------------------
//   // Compute grid layout by row
//   // ---------------------------
//   const getRowMap = useCallback(() => {
//     const map: number[] = []; // map[index] = row number
//     const topMap: number[] = [];

//     items.forEach((_, i) => {
//       const el = itemRefs.current.get(i);
//       if (!el) return;
//       const top = el.offsetTop;
//       let row = topMap.findIndex(t => Math.abs(t - top) < 5); // same row threshold 5px
//       if (row === -1) {
//         topMap.push(top);
//         row = topMap.length - 1;
//       }
//       map[i] = row;
//     });

//     return { map, topMap };
//   }, [items]);

//   // ---------------------------
//   // Handle keydown
//   // ---------------------------
//   const handleItemKeyDown = useCallback(
//     (e: React.KeyboardEvent, index: number) => {
//       if (!enableArrowKeys) return;

//       const target = e.target as HTMLElement | null;
//       if (target) {
//         const tag = target.tagName;
//         const isEditable =
//           tag === 'INPUT' || tag === 'TEXTAREA' || target.getAttribute('contenteditable') === 'true';
//         if (isEditable) return;
//       }

//       const { map, topMap } = getRowMap();
//       const row = map[index];
//       const colIndicesInRow = map
//         .map((r, i) => (r === row ? i : -1))
//         .filter(i => i !== -1);
//       let next = index;

//       switch (e.key) {
//         case 'ArrowRight': {
//           e.preventDefault();
//           const idx = colIndicesInRow.indexOf(index);
//           if (idx < colIndicesInRow.length - 1) next = colIndicesInRow[idx + 1];
//           break;
//         }
//         case 'ArrowLeft': {
//           e.preventDefault();
//           const idx = colIndicesInRow.indexOf(index);
//           if (idx > 0) next = colIndicesInRow[idx - 1];
//           break;
//         }
//         case 'ArrowDown': {
//           e.preventDefault();
//           const nextRow = row + 1;
//           const nextIndices = map
//             .map((r, i) => (r === nextRow ? i : -1))
//             .filter(i => i !== -1);
//           if (nextIndices.length > 0) {
//             // closest column
//             const offset = index - colIndicesInRow[0];
//             next = nextIndices[Math.min(offset, nextIndices.length - 1)];
//           }
//           break;
//         }
//         case 'ArrowUp': {
//           e.preventDefault();
//           const prevRow = row - 1;
//           const prevIndices = map
//             .map((r, i) => (r === prevRow ? i : -1))
//             .filter(i => i !== -1);
//           if (prevIndices.length > 0) {
//             const offset = index - colIndicesInRow[0];
//             next = prevIndices[Math.min(offset, prevIndices.length - 1)];
//           }
//           break;
//         }
//         case 'Home':
//           e.preventDefault();
//           next = 0;
//           break;
//         case 'End':
//           e.preventDefault();
//           next = items.length - 1;
//           break;
//         case 'Enter':
//           e.preventDefault();
//           if (onEnter && items[index]) onEnter(items[index]);
//           return;
//         default:
//           return;
//       }

//       setFocusedIndex(next);
//       focusItem(next);
//     },
//     [enableArrowKeys, getRowMap, items, onEnter, focusItem]
//   );

//   // ---------------------------
//   // Auto-focus first item
//   // ---------------------------
//   useEffect(() => {
//     if (items.length > 0 && focusedIndex === -1) setFocusedIndex(0);
//     else if (items.length === 0) setFocusedIndex(-1);
//     else if (focusedIndex >= items.length) setFocusedIndex(items.length - 1);
//   }, [items.length, focusedIndex]);

//   // ---------------------------
//   // Cleanup
//   // ---------------------------
//   useEffect(() => {
//     return () => itemRefs.current.clear();
//   }, []);

//   return {
//     gridRef,
//     focusedIndex,
//     setFocusedIndex,
//     registerItem,
//     handleItemKeyDown,
//     focusItem,
//   };
// }
import { useState, useRef, useCallback, useEffect } from "react";

interface UseKeyboardGridNavigationProps<T> {
    items: T[];
    getId: (item: T) => string;
    onEnter?: (item: T) => void;
    onNextPage?: () => void;
    onPrevPage?: () => void;
}

export function useKeyboardGridNavigation<T>({
    items,
    getId,
    onEnter,
    onNextPage,
    onPrevPage
}: UseKeyboardGridNavigationProps<T>) {
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const gridRef = useRef<HTMLDivElement | null>(null);
    const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

    // רישום הפריט + מדידת row
    const registerItem = useCallback((index: number, el: HTMLElement | null) => {
        if (el) {
            itemRefs.current.set(index, el);
        } else {
            itemRefs.current.delete(index);
        }
    }, []);

    const focusItem = useCallback((index: number) => {
        const el = itemRefs.current.get(index);
        if (!el) return;
        el.focus({ preventScroll: true });
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }, []);

    const handleItemKeyDown = useCallback((e: React.KeyboardEvent | KeyboardEvent, index: number) => {
        if (items.length === 0 || index === -1) return;

        const key = e.key;

        // בודקים אם הפוקוס בתוך input/textarea/contentEditable
        const target = e.target as HTMLElement;
        if (target) {
            const tag = target.tagName;
            const isEditable =
                tag === "INPUT" || tag === "TEXTAREA" || target.getAttribute("contenteditable") === "true";
            if (isEditable) return;
        }

        let nextIndex = index;

        const rows: number[] = [];
        const rowMap: Record<number, number[]> = {}; // rowTop -> [indices]
        itemRefs.current.forEach((el, i) => {
            const top = el.offsetTop;
            if (!rowMap[top]) rowMap[top] = [];
            rowMap[top].push(i);
            if (!rows.includes(top)) rows.push(top);
        });
        rows.sort((a, b) => a - b);

        const currentTop = itemRefs.current.get(index)?.offsetTop || 0;
        const currentRow = rowMap[currentTop];

        switch (key) {
            case "ArrowRight":
                e.preventDefault();
                nextIndex = Math.min(index + 1, items.length - 1);
                break;
            case "ArrowLeft":
                e.preventDefault();
                nextIndex = Math.max(index - 1, 0);
                break;
            case "ArrowDown":
                e.preventDefault();
                {
                    const nextRowTop = rows.find(top => top > currentTop);
                    if (nextRowTop !== undefined) {
                        // בוחרים את הספר הקרוב ביותר בעמודה הנוכחית
                        const currentLeft = itemRefs.current.get(index)?.offsetLeft || 0;
                        const nextRow = rowMap[nextRowTop];
                        let closest = nextRow[0];
                        let minDiff = Infinity;
                        nextRow.forEach(i => {
                            const diff = Math.abs((itemRefs.current.get(i)?.offsetLeft || 0) - currentLeft);
                            if (diff < minDiff) {
                                minDiff = diff;
                                closest = i;
                            }
                        });
                        nextIndex = closest;
                    }
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                {
                    const prevRowTop = [...rows].reverse().find(top => top < currentTop);
                    if (prevRowTop !== undefined) {
                        const currentLeft = itemRefs.current.get(index)?.offsetLeft || 0;
                        const prevRow = rowMap[prevRowTop];
                        let closest = prevRow[0];
                        let minDiff = Infinity;
                        prevRow.forEach(i => {
                            const diff = Math.abs((itemRefs.current.get(i)?.offsetLeft || 0) - currentLeft);
                            if (diff < minDiff) {
                                minDiff = diff;
                                closest = i;
                            }
                        });
                        nextIndex = closest;
                    }
                }
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (onEnter && items[index]) onEnter(items[index]);
                return;
            case "n":
            case "N":
                if (e.ctrlKey && onNextPage) {
                    e.preventDefault();
                    onNextPage();
                }
                return;
            case "p":
            case "P":
                if (e.ctrlKey && onPrevPage) {
                    e.preventDefault();
                    onPrevPage();
                }
                return;
        }

        setFocusedIndex(nextIndex);
        focusItem(nextIndex);
    }, [items, focusItem, onEnter, onNextPage, onPrevPage]);

    useEffect(() => {
        if (items.length > 0 && focusedIndex === -1) setFocusedIndex(0);
        if (focusedIndex >= items.length) setFocusedIndex(items.length - 1);
    }, [items.length, focusedIndex]);

    useEffect(() => {
        return () => itemRefs.current.clear();
    }, []);

    return {
        gridRef,
        focusedIndex,
        setFocusedIndex,
        registerItem,
        handleItemKeyDown,
        focusItem,
    };
}
