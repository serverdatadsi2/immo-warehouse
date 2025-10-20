import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Params, ReceivingOrder } from '@/types/receiving-order.type';
import { Head } from '@inertiajs/react';
import { Filters } from './components/filters';
import { HeaderTable } from './components/header/table';

export default function Page({ pagination, params }: PageProps) {
    return (
        <AppLayout navBarTitle="Receiving Store Orders">
            <Head title="Receiving Orders" />
            <Filters params={params} />
            <HeaderTable pagination={pagination} />
        </AppLayout>
    );
}

export type HeaderItem = ReceivingOrder;

type PageProps = {
    pagination: LaravelPagination<HeaderItem>;
    params: Params;
};
