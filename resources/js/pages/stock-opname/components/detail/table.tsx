import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { useCallback, useContext, useMemo } from 'react';
import { DetailContext, DetailItem } from '../../monitoring';

export function DetailTable() {
    const { detailsPagination: pagination } = useContext(DetailContext);
    console.log(pagination, 'pagination');
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
                title: 'System',
                dataIndex: 'system_qty',
                key: 'system_qty',
            },
            {
                title: 'Match',
                dataIndex: 'match_qty',
                key: 'match_qty',
            },
            {
                title: 'Missing',
                dataIndex: 'missing_qty',
                key: 'missing_qty',
            },
            {
                title: 'Extra',
                dataIndex: 'extra_qty',
                key: 'extra_qty',
            },
            {
                title: 'Varian',
                dataIndex: 'varian',
                key: 'varian',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
            },
        ],
        [pagination],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <>
            <CustomTable<DetailItem>
                size="small"
                rowKey="product_id"
                columns={columns}
                bordered
                dataSource={pagination?.data}
                onPaginationChange={handlePageChange}
                page={pagination?.current_page || 1}
                className="max-w-full"
                scroll={{ x: 'max-content' }}
            />
        </>
    );
}
