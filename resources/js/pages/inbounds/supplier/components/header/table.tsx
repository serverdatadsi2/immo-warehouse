import { DateDisplay } from '@/components/displays/date-display';
import { usePermission } from '@/hooks/use-permission';
import { appendQueryString } from '@/lib/utils';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { EditOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Pagination, Space, Table, Tag } from 'antd';
import { useCallback, useMemo } from 'react';
import { HeaderItem } from '../..';

export function HeaderTable({ pagination }: Props) {
    const { hasPermission } = usePermission();
    const handleAction = useCallback((val: HeaderItem) => {
        router.get(`/inbounds/supplier/detail?header_id=${val.id}`);
    }, []);

    const columns = useMemo(
        (): TableProps<HeaderItem>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: HeaderItem, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Supplier',
                dataIndex: 'supplier_name',
                key: 'supplier_name',
                align: 'center',
            },
            {
                title: 'Warehouse',
                dataIndex: 'warehouse_name',
                key: 'warehouse_name',
                align: 'center',
            },
            {
                title: 'Faktur',
                dataIndex: 'invoice_number',
                key: 'invoice_number',
                align: 'center',
            },
            {
                title: 'Surat Jalan',
                dataIndex: 'delivery_order_number',
                key: 'delivery_order_number',
                align: 'center',
            },
            {
                title: 'Quantity',
                dataIndex: 'quantity_item',
                key: 'quantity_item',
                align: 'center',
                render: (qty) => (
                    <Tag color="blue" style={{ fontWeight: 'bold' }}>
                        {qty}
                    </Tag>
                ),
            },
            {
                title: 'Grand Total',
                dataIndex: 'grand_total',
                key: 'grand_total',
                align: 'center',
                render: (total) => (
                    <Tag color="gold" style={{ fontWeight: 'bold' }}>
                        {total}
                    </Tag>
                ),
            },
            {
                title: 'Diterima',
                children: [
                    {
                        title: 'Nama',
                        dataIndex: 'received_name',
                        key: 'received_name',
                        align: 'center',
                    },
                    {
                        title: 'Tanggal',
                        dataIndex: 'received_date',
                        key: 'received_date',
                        align: 'center',
                        render: (v) => <DateDisplay val={v} />,
                    },
                ],
            },
            {
                title: 'Aksi',
                key: 'action',
                fixed: 'right',
                align: 'center',
                render: (_, d) =>
                    hasPermission('inbound.supplier.update') && (
                        <Button
                            onClick={() => handleAction(d)}
                            icon={<EditOutlined />}
                            type="primary"
                            style={{ borderRadius: 8 }}
                        />
                    ),
            },
        ],
        [handleAction, hasPermission, pagination],
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
                    style={{ marginTop: 16 }}
                />
            )}
        </Space>
    );
}

type Props = {
    pagination: LaravelPagination<HeaderItem> | undefined;
};
