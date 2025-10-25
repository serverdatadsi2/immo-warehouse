import { SaveButton } from '@/components/buttons/common-buttons';
import { LocaleDatePicker } from '@/components/date-picker/locale-date-picker';
import { FormItem } from '@/components/forms/form-item';
import { UserAsyncSelect } from '@/components/selects/user';
import { WarehouseAsyncSelect } from '@/components/selects/warehouse';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { usePermission } from '@/hooks/use-permission';
import { SharedData } from '@/types';
import { Inbound } from '@/types/inbound.type';
import { usePage } from '@inertiajs/react';
import { Card, Col, Form, Input, Row } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect } from 'react';
import { DetailContext } from '../../detail';

export function HeaderForm() {
    const { hasPermission } = usePermission();
    const { form, errors, post, processing } = useAntdInertiaForm<HeaderForm>('Inbound'); //destroy
    const { header, storeReturnId } = useContext(DetailContext);
    const { props } = usePage<SharedData>();

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue();
        post({
            url: '/inbounds/return-store',
            data: { ...header, ...formValues, store_return_id: storeReturnId },
        });
    }, [form, header, post, storeReturnId]);

    // const handleDelete = useCallback(() => {
    //     destroy({ url: `/inbounds/return-store/${header?.id}` });
    // }, [destroy, header?.id]);

    useEffect(() => {
        const { warehouse } = props.auth;
        if (warehouse) form.setFieldValue('warehouse_id', warehouse.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props]);

    return (
        <Card
            style={{
                background: '#fff7e6',
                boxShadow: '0 2px 8px #fffbe6',
                marginBottom: 24,
            }}
        >
            <Form form={form} layout="vertical" initialValues={header ?? undefined}>
                <Row gutter={[16, 8]} align="middle" justify="end">
                    {/* <Col span={8}>
                        <FormItem
                            name="supplier_id"
                            errorMessage={errors?.supplier_id}
                            required
                            label="Supplier"
                        >
                            <SupplierAsyncSelect />
                        </FormItem>
                    </Col> */}
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
                    <Col span={6}></Col>
                    <Col span={2}>
                        {/* <Space>
                            <DeleteButton onClick={handleDelete} disabled={!header || processing} /> */}
                        {hasPermission('inbound.return.write') && (
                            <SaveButton onClick={handleSave} disabled={processing} />
                        )}
                        {/* </Space> */}
                    </Col>
                </Row>
            </Form>
        </Card>
    );
}

type HeaderForm = Partial<Omit<Inbound, 'quantity' | 'grand_total'>> & {
    quantity: number;
    grand_total: number;
};
