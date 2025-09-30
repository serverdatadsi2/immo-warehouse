import { useMemo } from 'react';

type Props = {
    val: string | Date | undefined;
    showSeconds?: boolean; // optional to display seconds
    longMonth?: boolean;
};

export function DateDisplay({ val, longMonth }: Props) {
    const displayValue = useMemo(() => {
        if (!val) return '—';

        try {
            const dateObj = typeof val === 'string' ? new Date(val) : val;

            const options: Intl.DateTimeFormatOptions = {
                timeZone: 'Asia/Jakarta',
                day: '2-digit',
                month: longMonth ? 'long' : '2-digit',
                year: 'numeric',
            };

            // Format like "15/08/2025 14.40"
            const formatted = new Intl.DateTimeFormat('id-ID', options).format(dateObj);

            // Convert "/" to "-" for date, and replace "." in time with ":"
            return formatted
                .replace(/\//g, '-') // date
                .replace(/\./g, ':'); // time
        } catch {
            return 'Invalid Date';
        }
    }, [val, longMonth]);

    return <span>{displayValue}</span>;
}
