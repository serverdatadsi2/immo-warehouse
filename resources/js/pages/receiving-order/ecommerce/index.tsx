import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Params, ReceivingEcommerceOrder } from '@/types/receiving-order.type';
import { Head } from '@inertiajs/react';
import { Filters } from './components/filters';
import { HeaderTable } from './components/header/table';

export default function Page({ pagination, params }: PageProps) {
    return (
        <AppLayout navBarTitle="Receiving Ecommerce Orders">
            <Head title="Receiving Orders" />
            <Filters params={params} />
            <HeaderTable pagination={pagination} />
        </AppLayout>
    );
}

export type HeaderItem = ReceivingEcommerceOrder;

type PageProps = {
    pagination: SimplePagination<HeaderItem>;
    params: Params;
};
