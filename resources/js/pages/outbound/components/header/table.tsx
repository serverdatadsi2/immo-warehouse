import { appendQueryString } from '@/lib/utils';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Pagination, Space, Table } from 'antd';
import { Edit } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { HeaderItem } from '../..';

export function HeaderTable({ pagination }: Props) {
    const handleAction = useCallback((val: HeaderItem) => {
        router.get(`/outbound/detail?header_id=${val.id}`);
    }, []);

    const columns = useMemo(
        (): TableProps<HeaderItem>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: HeaderItem, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Warehouse',
                dataIndex: 'warehouse_name',
                key: 'warehouse_name',
            },
            {
                title: 'User',
                dataIndex: 'user_fullname',
                key: 'user_fullname',
            },
            {
                title: 'Faktur',
                dataIndex: 'invoice_number',
                key: 'invoice_number',
            },
            {
                title: 'Surat Jalan',
                dataIndex: 'delivery_order_number',
                key: 'delivery_order_number',
            },
            {
                title: 'Quantity',
                dataIndex: 'quantity_item',
                key: 'quantity_item',
            },
            {
                title: 'Grand Total',
                dataIndex: 'grand_total',
                key: 'grand_total',
            },
            {
                title: 'Order',
                children: [
                    {
                        title: 'Type',
                        dataIndex: 'order_ref',
                        key: 'order_ref',
                    },
                    {
                        title: 'Number',
                        dataIndex: 'order_number',
                        key: 'order_number',
                    },
                ],
            },
            {
                title: 'Action',
                key: 'action',
                fixed: 'right',
                render: (_, d) => (
                    <Button onClick={() => handleAction(d)} icon={<Edit size={17} />} />
                ),
            },
        ],
        [handleAction, pagination?.current_page, pagination?.per_page],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <Space direction="vertical" className="w-full">
            <Table<HeaderItem>
                size="small"
                rowKey="id"
                columns={columns}
                bordered
                dataSource={pagination?.data}
                pagination={false}
                className="max-w-full"
                scroll={{ x: 'max-content' }}
            />
            {pagination && (
                <Pagination
                    align="end"
                    current={pagination.current_page}
                    pageSize={pagination.per_page}
                    total={pagination.total}
                    onChange={handlePageChange}
                />
            )}
        </Space>
    );
}

type Props = {
    pagination: LaravelPagination<HeaderItem> | undefined;
};
