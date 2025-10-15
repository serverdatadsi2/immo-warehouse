import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { HistoryInboundWithRelation } from '@/types/inbound.type';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Head } from '@inertiajs/react';
import { Card } from 'antd';
import { HistoryTable } from './components/header/history-table';

export default function Page({ pagination }: PageProps) {
    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/inbounds/return-store" />}
            navBarTitle="History Return Inbound"
        >
            <Head title="History Inbound" />
            <Card
                style={{
                    background: '#fff7e6',
                    boxShadow: '0 2px 8px #fffbe6',
                }}
            >
                <HistoryTable pagination={pagination} />
            </Card>
        </AppLayout>
    );
}

type PageProps = {
    pagination: SimplePagination<HistoryInboundWithRelation> | null;
};
