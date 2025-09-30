import type { InputRef } from 'antd';
import { useEffect, useRef } from 'react';

export function useInputFocusOnMount(dependency: boolean) {
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (dependency) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [dependency]);

    return inputRef;
}
