import { useMemo } from 'react';

type Props = {
    val: string | number | undefined;
    fractionDigit?: number | undefined;
};

export function PercentageDisplay({ val, fractionDigit = 2 }: Props) {
    const displayValue = useMemo(() => {
        const num = typeof val === 'string' ? parseFloat(val) : val;

        if (val === undefined || isNaN(Number(num))) {
            return '—';
        }

        return `${Number(num).toFixed(fractionDigit).replace('.', ',')} %`;
    }, [val, fractionDigit]);

    return <span>{displayValue}</span>;
}
