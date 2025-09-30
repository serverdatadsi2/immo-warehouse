import { FormItem } from '@/components/forms/form-item';
import { CrudFormModal } from '@/components/modals/crud-form-modal';
import { CoaAsyncSelect } from '@/components/selects/coa-async-select';
import { useCrudForm } from '@/hooks/use-crud-form';
import { useFormCrudTitle } from '@/hooks/use-form-crud-title';
import { useInputFocusOnMount } from '@/hooks/use-input-focus-on-mount';
import { useToggleFormModalScope } from '@/hooks/use-toggle-form-modal-scope';
import { Checkbox, Col, Form, Input, Row, Select } from 'antd';
import { useCallback } from 'react';
import { Item } from '..';

export function FormPopup({ open, existingData, onClose, onSuccess }: Props) {
    const focusRef = useInputFocusOnMount(open);
    const modalTitle = useFormCrudTitle(existingData, 'COA');
    useToggleFormModalScope(open);

    const { handleSave, handleDelete, errors, form } = useCrudForm<FormType, Item>({
        url: '/master/chart-of-accounts',
        name: 'COA',
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
            onDelete={handleDelete}
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
                        <FormItem errorMessage={errors?.type} label="Type" name="type" required>
                            <Select
                                options={[
                                    { value: 'asset', label: 'Asset' },
                                    { value: 'liability', label: 'Liability' },
                                    { value: 'equity', label: 'Equity' },
                                    { value: 'revenue', label: 'Revenue' },
                                    { value: 'expense', label: 'Expense' },
                                ]}
                            />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            errorMessage={errors?.is_header}
                            label="Is Header"
                            name="is_header"
                            valuePropName="checked"
                        >
                            <Checkbox />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            errorMessage={errors?.parent_id}
                            label="COA Header"
                            name="parent_id"
                        >
                            <CoaAsyncSelect />
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
