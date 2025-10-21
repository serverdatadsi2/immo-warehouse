import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { InboundDetail } from '@/types/inbound.type';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Storage } from '@/types/storage.type';
import { Head } from '@inertiajs/react';
import { Card, Space, Typography } from 'antd';
import { createContext } from 'react';
import { HeaderItem } from '.';
import { DetailTable } from './components/detail/table';
import { StockTable } from './components/detail/table-stock';
import DescriptionHeader from './components/header/desctiption';

export const DetailContext = createContext<PageProps>({
    detailsPagination: null,
    header: null,
    availableStocks: null,
});

const { Title } = Typography;

export default function Page({ detailsPagination, header, availableStocks }: PageProps) {
    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/receiving-order/store-order" />}
            navBarTitle="Detail Store Order"
        >
            <Head title="Detail Store Order" />
            <DetailContext.Provider value={{ detailsPagination, header, availableStocks }}>
                <Space direction="vertical" className="w-full" size="large">
                    <Card
                        style={{
                            background: 'linear-gradient(90deg, #e3f0ff 0%, #fff 100%)',
                            borderRadius: 12,
                            boxShadow: '0 4px 24px #1890ff22',
                            marginBottom: 8,
                        }}
                    >
                        <DescriptionHeader />
                    </Card>
                    <Card
                        style={{
                            background: '#f5faff',
                            borderRadius: 12,
                            boxShadow: '0 2px 8px #1890ff11',
                            marginBottom: 8,
                        }}
                    >
                        <DetailTable />
                    </Card>
                    {availableStocks && availableStocks.length > 0 && (
                        <Card
                            style={{
                                background: '#fffbe6',
                                borderRadius: 12,
                                boxShadow: '0 2px 8px #ffe58f55',
                            }}
                        >
                            <Title level={5} style={{ color: '#faad14', marginBottom: 8 }}>
                                Stok Tersedia
                            </Title>
                            <StockTable />
                        </Card>
                    )}
                </Space>
            </DetailContext.Provider>
        </AppLayout>
    );
}

export type DetailItem = InboundDetail;

type PageProps = {
    header: Partial<HeaderItem> | null;
    detailsPagination: LaravelPagination<DetailItem> | null;
    availableStocks?: Storage[] | null;
};
