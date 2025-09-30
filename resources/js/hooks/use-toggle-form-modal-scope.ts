import { useEffect } from 'react';
import { useHotkeyUtils } from './use-hotkey-utils';

export function useToggleFormModalScope(dependency: boolean) {
    const { toggleFormModalScope, toggleGlobalScope } = useHotkeyUtils();

    useEffect(() => {
        if (dependency) {
            toggleFormModalScope();
        } else {
            toggleGlobalScope();
        }
    }, [dependency, toggleFormModalScope, toggleGlobalScope]);
}
