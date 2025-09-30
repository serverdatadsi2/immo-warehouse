import { AppLayout } from '@/layouts/app-layout';
import { Inbound } from '@/types/inbound.type';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { Button } from 'antd';
import { useCallback } from 'react';
import { HeaderTable } from './components/header/table';

export default function Page({ pagination }: PageProps) {
    const handleAdd = useCallback(() => {
        router.get('/inbounds/detail');
    }, []);

    return (
        <AppLayout navBarTitle="Inbound">
            <Head title="Inbound" />
            <Button onClick={handleAdd} type="primary" icon={<PlusOutlined />}>
                Add Inbound
            </Button>
            <HeaderTable pagination={pagination} />
        </AppLayout>
    );
}

export type HeaderItem = Inbound;

type PageProps = {
    pagination: LaravelPagination<HeaderItem>;
};
