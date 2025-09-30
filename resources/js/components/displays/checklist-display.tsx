import { Check, Minus } from 'lucide-react';

export function ChecklistDisplay({ val, falsyIcon }: Props) {
    if (val) {
        return <Check />;
    } else if (falsyIcon) {
        return <Minus />;
    }

    return <></>;
}

type Props = {
    val: boolean | undefined | null;
    falsyIcon?: boolean;
};
