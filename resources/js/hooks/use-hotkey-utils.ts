import { useCallback } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

export function useHotkeyUtils() {
    const { enableScope, disableScope } = useHotkeysContext();

    const toggleGlobalScope = useCallback(() => {
        disableScope('crud-form-modal');
        enableScope('global');
    }, [disableScope, enableScope]);

    const toggleFormModalScope = useCallback(() => {
        disableScope('global');
        enableScope('crud-form-modal');
    }, [disableScope, enableScope]);

    return { toggleGlobalScope, toggleFormModalScope };
}
