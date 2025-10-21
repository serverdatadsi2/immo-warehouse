import { AppLayout } from '@/layouts/app-layout';
import { EcommerceOrderWithDetailRelation } from '@/types/ecommerce-order.type';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Params } from '@/types/outbound-qc.type';
import { Head } from '@inertiajs/react';
import { StoreOrderComponent } from './components/order';

export default function Page({ params, pagination }: Props) {
    return (
        <AppLayout navBarTitle="Ecommerce Order Siap Packing">
            <Head title="Packing" />

            <StoreOrderComponent params={params} pagination={pagination} />
        </AppLayout>
    );
}

interface Props {
    params: Params;
    pagination: LaravelPagination<EcommerceOrderWithDetailRelation>;
}
