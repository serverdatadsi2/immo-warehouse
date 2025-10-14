import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { OutboundWithRelations } from '@/types/warehouse-outbound.type';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Space } from 'antd';
import { Edit } from 'lucide-react';
import { useCallback, useMemo } from 'react';

export function HeaderTable({ pagination }: Props) {
    const handleAction = useCallback((val: OutboundWithRelations) => {
        router.get(`/outbound/detail?header=${val.id}`);
    }, []);

    const columns = useMemo(
        (): TableProps<OutboundWithRelations>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: OutboundWithRelations, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Warehouse',
                dataIndex: ['warehouse', 'name'],
                key: 'warehouse_name',
            },
            {
                title: 'User',
                dataIndex: ['user', 'name'],
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
                title: 'Pengiriman',
                dataIndex: ['courier', 'name'],
                key: 'pengiriman',
            },
            {
                title: 'Quantity',
                dataIndex: 'quantity_item',
                key: 'quantity_item',
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
                    <Button
                        type="primary"
                        onClick={() => handleAction(d)}
                        icon={<Edit size={17} />}
                    />
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
            <CustomTable<OutboundWithRelations>
                rowKey="id"
                columns={columns}
                dataSource={pagination?.data}
                onPaginationChange={handlePageChange}
                page={pagination?.current_page || 1}
            />
        </Space>
    );
}

type Props = {
    pagination: SimplePagination<OutboundWithRelations> | undefined;
};
