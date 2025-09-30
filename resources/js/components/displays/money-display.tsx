import { useMemo } from 'react';

export function MoneyDisplay({
    val,
    prefix = '',
}: {
    val: string | number | null | undefined;
    prefix?: string;
}) {
    const value = useMemo((): string => {
        if (val == null || val === '') return '0';

        const raw = typeof val === 'number' ? val.toString() : val.trim();

        if (!/^-?\d*(?:\.\d+)?$/.test(raw)) return '0';

        const [intPart, decRaw = ''] = raw.split('.');

        const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // Limit to 4 decimal digits and remove trailing zeros
        const decTrimmed = decRaw.slice(0, 4).replace(/0+$/, '');

        return decTrimmed ? `${prefix}${withThousands},${decTrimmed}` : `${prefix}${withThousands}`;
    }, [val, prefix]);

    return <span>Rp. {value}</span>;
}
