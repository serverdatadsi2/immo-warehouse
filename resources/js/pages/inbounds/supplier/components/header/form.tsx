import { DeleteButton, SaveButton } from '@/components/buttons/common-buttons';
import { LocaleDatePicker } from '@/components/date-picker/locale-date-picker';
import { FormItem } from '@/components/forms/form-item';
import { SupplierAsyncSelect } from '@/components/selects/supplier';
import { UserAsyncSelect } from '@/components/selects/user';
import { WarehouseAsyncSelect } from '@/components/selects/warehouse';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { usePermission } from '@/hooks/use-permission';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Card, Col, Form, Input, Row, Space } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect } from 'react';
import { HeaderItem } from '../..';
import { DetailContext } from '../../detail';

export function HeaderForm() {
    const { hasPermission, hasAnyPermission } = usePermission();
    const { form, errors, post, processing, destroy } = useAntdInertiaForm<HeaderForm>('Inbound');
    const { header } = useContext(DetailContext);
    const { props } = usePage<SharedData>();

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue();
        post({ url: '/inbounds/supplier', data: { ...header, ...formValues } });
    }, [form, header, post]);

    const handleDelete = useCallback(() => {
        destroy({ url: `/inbounds/supplier/${header?.id}` });
    }, [destroy, header?.id]);

    useEffect(() => {
        const { warehouse } = props.auth;
        if (warehouse) form.setFieldValue('warehouse_id', warehouse.id);
    }, [props, form]);

    return (
        <Card
            style={{
                background: '#f5faff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #1890ff11',
                marginBottom: 24,
            }}
        >
            <Form form={form} layout="vertical" initialValues={header ?? undefined}>
                <Row gutter={[16, 8]}>
                    <Col span={8}>
                        <FormItem
                            name="supplier_id"
                            errorMessage={errors?.supplier_id}
                            required
                            label="Supplier"
                        >
                            <SupplierAsyncSelect />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            name="received_by"
                            errorMessage={errors?.received_by}
                            required
                            label="Diterima Oleh"
                        >
                            <UserAsyncSelect />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            name="received_date"
                            errorMessage={errors?.received_date}
                            label="Tanggal Diterima"
                            required
                        >
                            <LocaleDatePicker defaultValue={dayjs()} />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            errorMessage={errors?.warehouse_id}
                            name="warehouse_id"
                            required
                            label="Warehouse"
                        >
                            <WarehouseAsyncSelect disabled />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            errorMessage={errors?.delivery_order_number}
                            name="delivery_order_number"
                            label="Nomor Surat Jalan"
                        >
                            <Input placeholder="Masukkan nomor surat jalan..." />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            errorMessage={errors?.invoice_number}
                            name="invoice_number"
                            label="Nomor Faktur"
                        >
                            <Input placeholder="Masukkan nomor faktur..." />
                        </FormItem>
                    </Col>
                </Row>
                <Space style={{ marginTop: 24 }}>
                    {hasPermission('inbound.supplier.delete') && (
                        <DeleteButton onClick={handleDelete} disabled={!header || processing} />
                    )}
                    {hasAnyPermission(['inbound.supplier.create', 'inbound.supplier.update']) && (
                        <SaveButton onClick={handleSave} disabled={processing} />
                    )}
                </Space>
            </Form>
        </Card>
    );
}

type HeaderForm = Partial<Omit<HeaderItem, 'quantity' | 'grand_total'>> & {
    quantity: number;
    grand_total: number;
};
