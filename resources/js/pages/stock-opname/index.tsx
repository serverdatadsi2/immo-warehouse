import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Params, StockOpnameWithRelation } from '@/types/stock-opname.type';
import { Head } from '@inertiajs/react';
import { Filters } from './components/filters';
import { HeaderTable } from './components/header/table';

export default function Page({ pagination, params }: PageProps) {
    return (
        <AppLayout navBarTitle="Stok Opname">
            <Head title="Stok Opname" />
            <Filters params={params} />
            <HeaderTable pagination={pagination} />
        </AppLayout>
    );
}

export type HeaderItem = StockOpnameWithRelation;

type PageProps = {
    pagination: SimplePagination<HeaderItem>;
    params: Params;
};
