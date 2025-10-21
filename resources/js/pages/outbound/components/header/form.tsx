import { DeleteButton, SaveButton } from '@/components/buttons/common-buttons';
import { LocaleDatePicker } from '@/components/date-picker/locale-date-picker';
import { FormItem } from '@/components/forms/form-item';
import { CourierAsyncSelect } from '@/components/selects/courier';
import { OrderAsyncSelect } from '@/components/selects/order';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { SharedData } from '@/types';
import { Outbound } from '@/types/warehouse-outbound.type';
import { usePage } from '@inertiajs/react';
import { Card, Col, Form, Input, Row, Select, Space } from 'antd';
import { useCallback, useContext, useEffect } from 'react';
import { DetailContext } from '../../detail';
import DescriptionHeader from './desctiption';

export function HeaderForm() {
    const { form, errors, post, processing, destroy } =
        useAntdInertiaForm<HeaderFormType>('Outbound');
    const { headerData, params } = useContext(DetailContext);
    const { props } = usePage<SharedData>();

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue();
        post({ url: '/outbound', data: { ...headerData, ...formValues } });
    }, [form, headerData, post]);

    const handleDelete = useCallback(() => {
        destroy({ url: `/outbound/${headerData?.id}` });
    }, [destroy, headerData?.id]);

    useEffect(() => {
        if (props.auth.warehouses?.[0]) {
            const { user, warehouses } = props.auth;
            form.setFieldsValue({
                user_id: user.id,
                warehouse_id: warehouses[0].id,
            });
        }
        if (params?.storeOrder) {
            form.setFieldsValue({
                order_ref: 'store',
                order_id: params.storeOrder,
                outbound_type: 'store',
                order_number: params.orderNumber,
            });
        } else if (params?.ecommerceOrder) {
            form.setFieldsValue({
                order_ref: 'ecommerce',
                order_id: params.ecommerceOrder,
                outbound_type: 'ecommerce',
                order_number: params.orderNumber,
            });
        }
    }, [form, props, params]);

    return (
        <Card
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <Form form={form} layout="vertical" initialValues={headerData ?? undefined}>
                <FormItem
                    errorMessage={errors?.warehouse_id}
                    name="warehouse_id"
                    required
                    label="Warehouse"
                    hidden
                >
                    <Input />
                    {/* <WarehouseAsyncSelect disabled /> */}
                </FormItem>
                <FormItem
                    name="user_id"
                    errorMessage={errors?.user_id}
                    required
                    label="User Warehouse"
                    hidden
                >
                    <Input />
                    {/* <UserAsyncSelect disabled /> */}
                </FormItem>
                <FormItem name="order_number" errorMessage={errors?.order_number} hidden>
                    <Input />
                    {/* <UserAsyncSelect disabled /> */}
                </FormItem>
                <div className="mb-10">
                    <DescriptionHeader />
                </div>

                <Row gutter={[16, 8]}>
                    <Col span={6}>
                        <FormItem
                            name="shipment_date"
                            errorMessage={errors?.shipment_date}
                            required
                            label="Tanggal Pengiriman"
                        >
                            <LocaleDatePicker />
                        </FormItem>
                    </Col>
                    <Col span={6}>
                        <FormItem
                            errorMessage={errors?.courier_id}
                            name="courier_id"
                            label="Courier"
                        >
                            <CourierAsyncSelect />
                        </FormItem>
                    </Col>
                    <Col span={4}>
                        <FormItem
                            errorMessage={errors?.order_ref}
                            name="order_ref"
                            required
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
                    <Col span={4}>
                        <FormItem
                            errorMessage={errors?.order_id}
                            name="order_id"
                            required
                            label="Nomor Order"
                        >
                            <OrderAsyncSelect form={form} />
                        </FormItem>
                    </Col>
                    <Col span={4}>
                        <FormItem
                            errorMessage={errors?.outbound_type}
                            name="outbound_type"
                            required
                            label="Outbound Type"
                        >
                            <Select allowClear placeholder="Outbound To">
                                <Select.Option value="ecommerce">Ecommerce</Select.Option>
                                <Select.Option value="store">Store</Select.Option>
                                {/* <Select.Option value="destroy">Dimusnahkan</Select.Option>
                                <Select.Option value="transfer">Transfer</Select.Option>
                                <Select.Option value="return_to_supplier">
                                    Retur To Supplier
                                </Select.Option> */}
                            </Select>
                        </FormItem>
                    </Col>
                </Row>
            </Form>
            <Space>
                <DeleteButton onClick={handleDelete} disabled={!headerData || processing} />
                <SaveButton onClick={handleSave} disabled={processing} />
            </Space>
        </Card>
    );
}

type HeaderFormType = Partial<Omit<Outbound, 'quantity' | 'grand_total'>> & {
    quantity: number;
    grand_total: number;
};
