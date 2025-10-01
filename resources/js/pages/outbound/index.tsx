import { AddButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Outbound } from '@/types/outbound.type';
import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';
import { HeaderTable } from './components/header/table';

export default function Page({ pagination }: PageProps) {
    const handleAdd = useCallback(() => {
        router.get('/outbound/detail');
    }, []);

    return (
        <AppLayout navBarTitle="Outbound">
            <Head title="Outbound" />
            <AddButton onClick={handleAdd} />
            <HeaderTable pagination={pagination} />
        </AppLayout>
    );
}

export type HeaderItem = Outbound;

type PageProps = {
    pagination: LaravelPagination<HeaderItem>;
};
