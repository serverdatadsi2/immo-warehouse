import { DatePicker, DatePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

type Props = Omit<DatePickerProps, 'value' | 'onChange'> & {
    value?: string; // expects YYYY-MM-DD
    onChange?: (val: string | null) => void;
};

export function LocaleDatePicker({ value, onChange, ...props }: Props) {
    const displayFormat = 'DD-MM-YYYY'; // UI format
    const valueFormat = 'YYYY-MM-DD'; // internal string format

    const handleChange = (date: Dayjs | null) => {
        if (onChange) {
            onChange(date ? date.format(valueFormat) : null);
        }
    };

    return (
        <DatePicker
            {...props}
            format={displayFormat}
            value={value ? dayjs(value, valueFormat) : null}
            onChange={handleChange}
            className="w-full"
        />
    );
}
