import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { ShippingMethod } from '@/types/shipping-method.type';
import {
    OrderWithRelation,
    OutboundDetailWithRelation,
    OutboundWithRelations,
} from '@/types/warehouse-outbound.type';
import { Head } from '@inertiajs/react';
import { Card, Col, Row, Space } from 'antd';
import { createContext } from 'react';
import { DetailForm } from './components/detail/form';
import { OrderTable } from './components/detail/order-table';
import { DetailTable } from './components/detail/table';
import { HeaderForm } from './components/header/form';

export const DetailContext = createContext<PageProps>({
    detailsPagination: null,
    headerData: null,
    params: null,
    shippingMethod: null,
    order: null,
});

export default function Page({
    detailsPagination,
    params,
    headerData,
    shippingMethod,
    order,
}: PageProps) {
    return (
        <AppLayout navBarLeft={<BackButton backUrl="/outbound" />} navBarTitle="Outboud Detail">
            <Head title="Outbound Detail" />
            <DetailContext.Provider
                value={{ detailsPagination, headerData, params, shippingMethod, order }}
            >
                <Space direction="vertical" className="w-full">
                    <HeaderForm />
                    {headerData && (
                        <Row gutter={20}>
                            <Col span={6}>
                                <OrderTable />
                            </Col>
                            <Col span={18}>
                                <Card
                                    size="small"
                                    style={{
                                        background: '#f5faff',
                                        boxShadow: '0 2px 8px #1890ff11',
                                        paddingLeft: 20,
                                    }}
                                >
                                    {' '}
                                    <DetailForm />
                                    <DetailTable />
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Space>
            </DetailContext.Provider>
        </AppLayout>
    );
}

type PageProps = {
    params: {
        headerId: string;
        storeOrder: string;
        ecommerceOrder: string;
        orderNumber: string;
    } | null;
    headerData: Partial<OutboundWithRelations> | null;
    detailsPagination: SimplePagination<OutboundDetailWithRelation> | null;
    shippingMethod: ShippingMethod | null;
    order: OrderWithRelation[] | null;
};
