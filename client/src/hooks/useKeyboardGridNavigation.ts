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

        const target = e.target as HTMLElement;
        if (target) {
            const tag = target.tagName;
            const isEditable =
                tag === "INPUT" || tag === "TEXTAREA" || target.getAttribute("contenteditable") === "true";
            if (isEditable) return;
        }

        let nextIndex = index;

        const rows: number[] = [];
        const rowMap: Record<number, number[]> = {};
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
