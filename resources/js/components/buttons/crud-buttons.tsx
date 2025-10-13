import {
    CloseOutlined,
    DeleteOutlined,
    DoubleLeftOutlined,
    PlusOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, ButtonProps, Tooltip } from 'antd';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export function SaveButton({ onClick, ...props }: Props) {
    useHotkeys('enter', () => onClick(), { scopes: ['crud-form-modal'], enableOnFormTags: true });
    return (
        <Tooltip title="(enter)">
            <Button {...props} onClick={onClick} icon={<SaveOutlined />} type="primary">
                Save
            </Button>
        </Tooltip>
    );
}

export function DeleteButton({ onClick, ...props }: Props) {
    useHotkeys('alt+m', () => onClick(), { scopes: ['crud-form-modal'], enableOnFormTags: true });
    return (
        <Tooltip title="(alt+m)">
            <Button {...props} onClick={onClick} icon={<DeleteOutlined />} danger>
                Delete
            </Button>
        </Tooltip>
    );
}

export function CloseButton({ onClick, ...props }: Props) {
    useHotkeys('escape', () => onClick(), { scopes: ['crud-form-modal'], enableOnFormTags: true });
    return (
        <Tooltip title="(esc)">
            <Button {...props} onClick={onClick} icon={<CloseOutlined />} />
        </Tooltip>
    );
}

export function AddButton({ onClick, children, ...props }: Props) {
    useHotkeys('alt+a', () => onClick(), { scopes: ['global'], enableOnFormTags: true });
    return (
        <Tooltip title="(alt+a)">
            <Button
                {...props}
                onClick={onClick}
                icon={props.icon ?? <PlusOutlined />}
                type="primary"
            >
                {children ?? 'Add'}
            </Button>
        </Tooltip>
    );
}

export function BackButton({ backUrl }: { backUrl: string }) {
    const handleBack = useCallback(() => {
        router.get(backUrl);
    }, [backUrl]);

    return (
        <Button
            size="large"
            style={{ fontSize: '1.1rem' }}
            type="text"
            icon={<DoubleLeftOutlined />}
            onClick={handleBack}
        />
    );
}

type Props = Omit<ButtonProps, 'onClick'> & {
    onClick: () => void;
};
