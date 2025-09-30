import { FormItem } from '@/components/forms/form-item';
import { CrudFormModal } from '@/components/modals/crud-form-modal';
import { useCrudForm } from '@/hooks/use-crud-form';
import { useFormCrudTitle } from '@/hooks/use-form-crud-title';
import { useInputFocusOnMount } from '@/hooks/use-input-focus-on-mount';
import { useToggleFormModalScope } from '@/hooks/use-toggle-form-modal-scope';
import { Col, Form, Input, Row } from 'antd';
import { useCallback } from 'react';
import { Item } from '..';

export function FormPopup({ open, existingData, onClose, onSuccess }: Props) {
    const focusRef = useInputFocusOnMount(open);
    const modalTitle = useFormCrudTitle(existingData, 'Transaction Type');
    useToggleFormModalScope(open);

    const { handleSave, errors, form } = useCrudForm<FormType, Item>({
        url: '/master/transaction-types',
        name: 'Transaction Type',
        onSuccess,
        existingData,
    });

    const handleClose = useCallback(() => {
        onClose();
        form.resetFields();
    }, [form, onClose]);

    return (
        <CrudFormModal<Item>
            existingData={existingData}
            title={modalTitle}
            open={open}
            onSave={handleSave}
            onClose={handleClose}
            onDelete={() => {}}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem errorMessage={errors?.name} label="Code" name="code" required>
                            <Input ref={focusRef as any} />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem errorMessage={errors?.name} label="Name" name="name" required>
                            <Input />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            errorMessage={errors?.description}
                            label="Description"
                            name="description"
                        >
                            <Input />
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </CrudFormModal>
    );
}

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingData: Item | undefined;
};

type FormType = Partial<Item>;
