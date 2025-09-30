import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { ReceivingOrder } from '@/types/receiving-order.type';
import { Head } from '@inertiajs/react';
import { HeaderTable } from './components/header/table';

export default function Page({ pagination }: PageProps) {
    return (
        <AppLayout navBarTitle="Receiving Orders">
            <Head title="Receiving Orders" />
            <HeaderTable pagination={pagination} />
        </AppLayout>
    );
}

export type HeaderItem = ReceivingOrder;

type PageProps = {
    pagination: LaravelPagination<HeaderItem>;
};
