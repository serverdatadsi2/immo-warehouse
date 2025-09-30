import { useMemo } from 'react';

export function useFormCrudTitle(existingData: unknown, name: string) {
    const title = useMemo(() => `${existingData ? 'Edit' : 'Add'} ${name}`, [existingData, name]);
    return title;
}
