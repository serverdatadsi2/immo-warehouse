import { useMemo } from 'react';

type Props = {
    val: string | number | undefined;
};

export function PcsDisplay({ val }: Props) {
    const displayValue = useMemo(() => {
        const num = typeof val === 'string' ? parseFloat(val) : val;

        if (val === undefined || isNaN(Number(num)) || !num) {
            return '—';
        }

        return `${num.toLocaleString('de-DE', {
            // minimumFractionDigits: 3,
            maximumFractionDigits: 2,
        })} pcs`;
    }, [val]);

    return <span>{displayValue}</span>;
}
