import { CloseOutlined } from '@ant-design/icons';
import { Modal, ModalProps, Space, Tooltip } from 'antd';
import { ReactNode } from 'react';
import { DeleteButton, SaveButton } from '../buttons/crud-buttons';

export function CrudFormModal<Item>({
    onSave,
    onClose,
    open,
    existingData,
    onDelete,
    extraButton,
    ...props
}: Props<Item>) {
    return (
        <Modal
            closeIcon={
                <Tooltip title="(esc)">
                    <CloseOutlined />
                </Tooltip>
            }
            open={open}
            onCancel={onClose}
            footer={
                <Space>
                    <DeleteButton onClick={onDelete} disabled={Boolean(!existingData)} />
                    <SaveButton onClick={onSave} />
                    {extraButton}
                </Space>
            }
            {...props}
        />
    );
}

type Props<Item> = ModalProps & {
    onSave: () => void;
    onDelete: () => void;
    onClose: () => void;
    existingData: (Omit<Item, 'id'> & { id: number }) | undefined;
    extraButton?: ReactNode;
};
