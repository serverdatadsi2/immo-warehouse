import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { StockOpnameDetailWithRelation } from '@/types/stock-opname.type';
import { Head } from '@inertiajs/react';
import { Card, Space } from 'antd';
import { createContext } from 'react';
import { HeaderItem } from '.';
import { DetailTable } from './components/detail/table';
import DescriptionHeader from './components/header/desctiption';

export const DetailContext = createContext<PageProps>({
    detailsPagination: null,
    header: null,
});

export default function Page({ detailsPagination, header }: PageProps) {
    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/stock-opname" />}
            navBarTitle="Monitoring Stock Opname"
        >
            <Head title="Stock Opname" />
            <DetailContext.Provider value={{ detailsPagination, header }}>
                <Space direction="vertical" className="w-full" size="large">
                    <Card
                        style={{
                            background: 'linear-gradient(90deg, #e3f0ff 0%, #fff 100%)',
                            boxShadow: '0 4px 24px #1890ff22',
                            marginBottom: 8,
                        }}
                    >
                        <DescriptionHeader />
                    </Card>
                    <Card
                        style={{
                            background: '#f5faff',
                            boxShadow: '0 2px 8px #1890ff11',
                        }}
                    >
                        <DetailTable />
                    </Card>
                </Space>
            </DetailContext.Provider>
        </AppLayout>
    );
}

export type DetailItem = StockOpnameDetailWithRelation;

type PageProps = {
    header: Partial<HeaderItem> | null;
    detailsPagination: LaravelPagination<DetailItem> | null;
};
