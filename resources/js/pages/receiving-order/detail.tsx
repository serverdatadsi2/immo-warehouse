import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { InboundDetail } from '@/types/inbound.type';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Storage } from '@/types/storage.type';
import { Head } from '@inertiajs/react';
import { Space } from 'antd';
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

export default function Page({ detailsPagination, header, availableStocks }: PageProps) {
    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/receiving-order" />}
            navBarTitle="Store Order Detail"
        >
            <Head title="Store Order Detail" />
            <DetailContext.Provider value={{ detailsPagination, header, availableStocks }}>
                <Space direction="vertical" className="w-full">
                    <DescriptionHeader />
                    <DetailTable />
                    {availableStocks && availableStocks.length > 0 && <StockTable />}
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
