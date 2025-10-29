import { DateDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { usePermission } from '@/hooks/use-permission';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { OutboundWithRelations } from '@/types/warehouse-outbound.type';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Space } from 'antd';
import { Edit } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import SuratJalanPrinter from './surat-jalan-print';

export function HeaderTable({ pagination }: Props) {
    const { hasPermission } = usePermission();
    const handleAction = useCallback((val: OutboundWithRelations) => {
        router.get(`/outbound/detail?headerId=${val.id}`);
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
            // {
            //     title: 'Warehouse',
            //     dataIndex: ['warehouse', 'name'],
            //     key: 'warehouse_name',
            // },
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
                render: (_, d) =>
                    d?.courier?.name || d?.ecommerce_order.shipping_method.courier_name,
            },
            {
                title: 'QTY',
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
                title: 'Release At',
                dataIndex: 'released_at',
                key: 'release_at',
                render: (v) => <DateDisplay val={v} />,
            },
            {
                title: 'Action',
                key: 'action',
                fixed: 'right',
                render: (_, d) => (
                    <Space>
                        {d?.released_at
                            ? null
                            : hasPermission('outbound.update') && (
                                  <Button
                                      type="primary"
                                      onClick={() => handleAction(d)}
                                      icon={<Edit size={17} />}
                                  />
                              )}
                        {!!d.quantity_item && <SuratJalanPrinter headerId={d.id} />}
                    </Space>
                ),
            },
        ],
        [handleAction, pagination, hasPermission],
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
                className="max-w-full"
                scroll={{ x: 'max-content' }}
            />
        </Space>
    );
}

type Props = {
    pagination: SimplePagination<OutboundWithRelations> | undefined;
};
