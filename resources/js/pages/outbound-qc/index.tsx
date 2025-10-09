import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Params, StoreOrderWithRelatons } from '@/types/outbound-qc.type';
import { Head } from '@inertiajs/react';
import { Splitter } from 'antd';
import { StoreOrderComponent } from './components/left-pannel/store-order';
import LogTable from './components/right-pannel/table';

export default function Page({ params, pagination }: Props) {
    return (
        <AppLayout navBarTitle="Outbound QC">
            <Head title="Outbound QC" />

            <Splitter>
                <Splitter.Panel defaultSize="40%" min="10%" max="80%" collapsible>
                    <StoreOrderComponent params={params} pagination={pagination} />
                </Splitter.Panel>
                <Splitter.Panel collapsible>
                    <LogTable />
                </Splitter.Panel>
            </Splitter>
        </AppLayout>
    );
}

interface Props {
    params: Params;
    pagination: LaravelPagination<StoreOrderWithRelatons>;
}
