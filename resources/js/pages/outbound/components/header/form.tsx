import { DeleteButton, SaveButton } from '@/components/buttons/common-buttons';
import { LocaleDatePicker } from '@/components/date-picker/locale-date-picker';
import { FormItem } from '@/components/forms/form-item';
import { CourierAsyncSelect } from '@/components/selects/courier';
import { UserAsyncSelect } from '@/components/selects/user';
import { WarehouseAsyncSelect } from '@/components/selects/warehouse';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Col, Form, Input, Row, Select, Space } from 'antd';
import { useCallback, useContext, useEffect } from 'react';
import { HeaderItem } from '../..';
import { DetailContext } from '../../detail';

export function HeaderForm() {
    const { form, errors, post, processing, destroy } = useAntdInertiaForm<HeaderForm>('Outbound');
    const { header } = useContext(DetailContext);
    const { props } = usePage<SharedData>();

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue();
        post({ url: '/outbound', data: { ...header, ...formValues } });
    }, [form, header, post]);

    const handleDelete = useCallback(() => {
        destroy({ url: `/outbound/${header?.id}` });
    }, [destroy, header?.id]);

    useEffect(() => {
        if (props.auth.warehouses?.[0]) {
            const { user, warehouses } = props.auth;
            form.setFieldsValue({
                user_id: user.id,
                warehouse_id: warehouses[0].id,
            });
        }
    }, [form, props]);

    return (
        <>
            <Form form={form} layout="vertical" initialValues={header ?? undefined}>
                <Row gutter={[16, 8]}>
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
                            name="user_id"
                            errorMessage={errors?.user_id}
                            required
                            label="User Gudang"
                        >
                            <UserAsyncSelect disabled />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            name="shipment_date"
                            errorMessage={errors?.shipment_date}
                            label="Tanggal Pengiriman"
                        >
                            <LocaleDatePicker />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            errorMessage={errors?.delivery_order_number}
                            name="delivery_order_number"
                            label="Nomor Surat Jalan"
                        >
                            <Input />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            errorMessage={errors?.invoice_number}
                            name="invoice_number"
                            label="Nomor Faktur"
                        >
                            <Input />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            errorMessage={errors?.courier_id}
                            name="courier_id"
                            label="Pengiriman"
                        >
                            <CourierAsyncSelect />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            errorMessage={errors?.order_ref}
                            name="order_ref"
                            label="Tipe Order"
                        >
                            <Select
                                options={[
                                    { label: 'Ecommerce', value: 'ecommerce' },
                                    { label: 'Store', value: 'store' },
                                ]}
                            />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            errorMessage={errors?.order_id}
                            name="order_id"
                            label="Pengiriman"
                        >
                            <Input placeholder="Input Nomor Order" />
                        </FormItem>
                    </Col>
                </Row>
            </Form>
            <Space>
                <DeleteButton onClick={handleDelete} disabled={!header || processing} />
                {/* <PrintModal /> */}
                <SaveButton onClick={handleSave} disabled={processing} />
                {/* <PostJurnalButton onClick={handlePostJournal} disabled={processing || !header} /> */}
            </Space>
        </>
    );
}

type HeaderForm = Partial<Omit<HeaderItem, 'quantity' | 'grand_total'>> & {
    quantity: number;
    grand_total: number;
};
