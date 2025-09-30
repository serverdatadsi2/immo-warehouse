import { InputNumber, InputNumberProps } from 'antd';

export function MoneyInput(props: Props) {
    return (
        <InputNumber<number>
            {...props}
            formatter={formatter}
            parser={parser}
            decimalSeparator=","
            onChange={props.onChange}
            style={{ width: '100%' }}
            controls={false}
            prefix="Rp. "
        />
    );
}

const formatter = (val?: string | number) => {
    if (val === '' || val == null) return '';
    const [intPart, decPart] = String(val).split('.');
    const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // 1000 -> 1.000
    return decPart !== undefined ? `${withThousands},${decPart}` : withThousands;
};

const parser = (str: string | undefined) => {
    if (!str) return 0;
    const normalised = str
        .replace(/\./g, '') // remove 1.000 → 1000
        .replace(',', '.'); // turn “,” into decimal point
    const num = Number(normalised);
    return Number.isNaN(num) ? 0 : num;
};

type Props = InputNumberProps<number>;
