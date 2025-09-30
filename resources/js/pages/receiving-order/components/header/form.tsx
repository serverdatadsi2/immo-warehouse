import { DeleteButton, SaveButton } from '@/components/buttons/common-buttons';
import { LocaleDatePicker } from '@/components/date-picker/locale-date-picker';
import { FormItem } from '@/components/forms/form-item';
import { SupplierAsyncSelect } from '@/components/selects/supplier';
import { UserAsyncSelect } from '@/components/selects/user';
import { WarehouseAsyncSelect } from '@/components/selects/warehouse';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { Col, Form, Input, Row, Space } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useContext } from 'react';
import { HeaderItem } from '../..';
import { DetailContext } from '../../detail';

export function HeaderForm() {
    const { form, errors, post, processing, destroy } = useAntdInertiaForm<HeaderForm>('Inbound');
    const { header } = useContext(DetailContext);

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue();
        post({ url: '/inbounds', data: { ...header, ...formValues } });
    }, [form, header, post]);

    const handleDelete = useCallback(() => {
        destroy({ url: `/inbounds/${header?.id}` });
    }, [destroy, header?.id]);

    return (
        <>
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
                            label="Tanggal diterima"
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
                            label="Gudang"
                        >
                            <WarehouseAsyncSelect />
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
