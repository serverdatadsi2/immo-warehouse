import { useCallback, useRef } from 'react';

export function useDebounce(callback: (...args: any[]) => void, delay: number) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    return useCallback(
        (...args: any[]) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay],
    );
}
