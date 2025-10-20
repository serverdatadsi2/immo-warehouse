import { LaravelTable } from '@/components/tables/laravel-table';
import { appendQueryString } from '@/lib/utils';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { useCallback, useContext, useMemo } from 'react';
import { DetailContext, DetailItem } from '../../detail';

export function DetailTable() {
    const { detailsPagination: pagination } = useContext(DetailContext);

    const columns = useMemo(
        (): TableProps<DetailItem>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: DetailItem, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Product',
                dataIndex: 'product_name',
                key: 'product_name',
            },
            {
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
            },
            {
                title: 'Note',
                dataIndex: 'note',
                key: 'note',
            },
        ],
        [pagination],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <>
            <LaravelTable<DetailItem>
                rowKey="id"
                columns={columns}
                onPageChange={handlePageChange}
                pagination={pagination}
            />
        </>
    );
}
