import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { Inbound, InboundDetail } from '@/types/inbound.type';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { ReturnStoreWithDetailRelation } from '@/types/return-store.type';
import { Head } from '@inertiajs/react';
import { Space } from 'antd';
import { createContext } from 'react';
import { DetailTable } from './components/detail/table';
import { HeaderForm } from './components/header/form';

export const DetailContext = createContext<PageProps>({
    detailsPagination: null,
    header: null,
    storeReturn: null,
    storeReturnId: null,
});

export default function Page({ detailsPagination, header, storeReturn, storeReturnId }: PageProps) {
    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/inbounds/return-store" />}
            navBarTitle="Return Inbound Detail"
        >
            <Head title="Inbound Detail" />
            <DetailContext.Provider
                value={{ detailsPagination, header, storeReturn, storeReturnId }}
            >
                <Space direction="vertical" className="w-full">
                    <HeaderForm />
                    {header && <DetailTable />}
                </Space>
            </DetailContext.Provider>
        </AppLayout>
    );
}

export type DetailItem = InboundDetail;

type PageProps = {
    header: Partial<Inbound> | null;
    detailsPagination: LaravelPagination<DetailItem> | null;
    storeReturn: ReturnStoreWithDetailRelation | null;
    storeReturnId: string | null;
};
