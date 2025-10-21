import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Params, StoreOrderWithRelatons } from '@/types/outbound-qc.type';
import { Head } from '@inertiajs/react';
import { StoreOrderComponent } from './components/store-order';

export default function Page({ params, pagination }: Props) {
    return (
        <AppLayout navBarTitle="Store Order Siap Packing">
            <Head title="Packing" />

            <StoreOrderComponent params={params} pagination={pagination} />
        </AppLayout>
    );
}

interface Props {
    params: Params;
    pagination: LaravelPagination<StoreOrderWithRelatons>;
}
