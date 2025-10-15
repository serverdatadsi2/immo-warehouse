import { DeleteButton, SaveButton } from '@/components/buttons/common-buttons';
import { LocaleDatePicker } from '@/components/date-picker/locale-date-picker';
import { FormItem } from '@/components/forms/form-item';
import { ProductAsyncSelect } from '@/components/selects/product';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { CloseOutlined } from '@ant-design/icons';
import { Col, Form, Input, InputNumber, Modal, Row, Space, Tooltip } from 'antd';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { DetailContext, DetailItem } from '../../detail';

export function DetailForm({ onClose, existingData, open }: Props) {
    const { form, errors, processing, post, destroy } =
        useAntdInertiaForm<DetailForm>('Inbound Detail');
    const modalTitle = useMemo(() => `${existingData ? 'Edit' : 'Add'} Detail`, [existingData]);
    const { header } = useContext(DetailContext);

    const _onClose = useCallback(() => {
        form.resetFields();
        onClose();
    }, [form, onClose]);

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue();
        post({
            url: '/inbounds/return-store/detail',
            data: { ...existingData, ...formValues, warehouse_inbound_id: header?.id },
            onSuccess: _onClose,
        });
    }, [_onClose, existingData, form, header?.id, post]);

    const handleDelete = useCallback(() => {
        destroy({ url: `/inbounds/return-store/detail/${existingData?.id}`, onSuccess: _onClose });
    }, [destroy, existingData?.id, _onClose]);

    useEffect(() => {
        if (existingData)
            form.setFieldsValue({
                ...existingData,
                quantity: Number(existingData.quantity),
            });
    }, [existingData, form]);

    return (
        <Modal
            title={modalTitle}
            footer={
                <Space>
                    <DeleteButton onClick={handleDelete} disabled={!existingData || processing} />
                    <SaveButton onClick={handleSave} disabled={processing} />
                </Space>
            }
            open={open}
            onCancel={_onClose}
            closeIcon={
                <Tooltip title="(esc)">
                    <CloseOutlined />
                </Tooltip>
            }
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={24}>
                        <FormItem
                            errorMessage={errors?.product_id}
                            name="product_id"
                            label="Product"
                            required
                        >
                            <ProductAsyncSelect />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            errorMessage={errors?.quantity}
                            name="quantity"
                            label="Quantity"
                            required
                        >
                            <InputNumber className="!w-full" type="number" />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            errorMessage={errors?.expired_date}
                            name="expired_date"
                            label="Expired Date"
                        >
                            <LocaleDatePicker />
                        </FormItem>
                    </Col>
                    <Col span={24}>
                        <FormItem errorMessage={errors?.note} name="note" label="Note">
                            <Input.TextArea />
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}

type Props = {
    open: boolean;
    onClose: () => void;
    existingData: DetailItem | undefined;
};

type DetailForm = Partial<Omit<DetailItem, 'quantity'>> & {
    quantity: number;
};
