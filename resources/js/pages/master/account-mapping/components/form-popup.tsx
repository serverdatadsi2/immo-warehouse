import { FormItem } from '@/components/forms/form-item';
import { CrudFormModal } from '@/components/modals/crud-form-modal';
import { CoaAsyncSelect } from '@/components/selects/coa-async-select';
import { useCrudForm } from '@/hooks/use-crud-form';
import { useFormCrudTitle } from '@/hooks/use-form-crud-title';
import { useToggleFormModalScope } from '@/hooks/use-toggle-form-modal-scope';
import { Col, Form, Row, Select } from 'antd';
import { useCallback } from 'react';
import { Item } from '..';

export function FormPopup({ open, existingData, onClose, onSuccess }: Props) {
    const modalTitle = useFormCrudTitle(existingData, 'Account Mapping');
    useToggleFormModalScope(open);

    const { handleSave, errors, form } = useCrudForm<FormType, Item>({
        url: '/master/account-mappings',
        name: 'Account Mapping',
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
                        <FormItem label="Transaction Type">
                            {existingData?.transaction_type_name}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label="Description">{existingData?.description}</FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem errorMessage={errors?.coa_id} label="COA" name="coa_id" required>
                            <CoaAsyncSelect />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            errorMessage={errors?.action}
                            label="Action"
                            name="action"
                            required
                        >
                            <Select
                                options={[
                                    { value: 'debit', label: 'Debit' },
                                    { value: 'credit', label: 'Credit' },
                                ]}
                            />
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
