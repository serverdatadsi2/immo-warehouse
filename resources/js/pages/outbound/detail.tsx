import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { OutboundDetailWithRelation, OutboundWithRelations } from '@/types/warehouse-outbound.type';
import { Head } from '@inertiajs/react';
import { Card, Space } from 'antd';
import { createContext } from 'react';
import { DetailForm } from './components/detail/form';
import { DetailTable } from './components/detail/table';
import { HeaderForm } from './components/header/form';

export const DetailContext = createContext<PageProps>({
    detailsPagination: null,
    headerData: null,
    params: null,
});

export default function Page({ detailsPagination, params, headerData }: PageProps) {
    return (
        <AppLayout navBarLeft={<BackButton backUrl="/outbound" />} navBarTitle="Outboud Detail">
            <Head title="Outbound Detail" />
            <DetailContext.Provider value={{ detailsPagination, headerData, params }}>
                <Space direction="vertical" className="w-full">
                    <HeaderForm />
                    {headerData && (
                        <Card
                            size="small"
                            style={{
                                background: '#f5faff',
                                boxShadow: '0 2px 8px #1890ff11',
                                paddingLeft: 20,
                            }}
                        >
                            <DetailForm />
                            <DetailTable />
                        </Card>
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
};
