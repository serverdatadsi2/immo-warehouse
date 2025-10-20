import { DateDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Storage } from '@/types/storage.type';
import { router } from '@inertiajs/react';
import { Card, TableProps, Tag } from 'antd';
import { useCallback, useMemo } from 'react';

interface Props {
    pagination: SimplePagination<Storage> | null;
}

export default function TableData({ pagination }: Props) {
    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    const columns = useMemo(
        (): TableProps<Storage>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: Storage, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Nama Barang',
                dataIndex: 'product_name',
                key: 'product_name',
                align: 'left',
            },
            {
                title: 'Kode Barang',
                dataIndex: 'product_code',
                key: 'product_code',
                align: 'center',
                render: (code) => <Tag color="blue">{code}</Tag>,
            },
            {
                title: 'Expired Date',
                dataIndex: 'expired_date',
                key: 'expired_date',
                align: 'center',
                render: (val) => <DateDisplay val={val} />,
            },
            {
                title: 'Lokasi Barang',
                key: 'location',
                dataIndex: 'location',
                align: 'left',
                render: (_, record: Storage) => {
                    const parts: string[] = [];
                    if (record?.warehouse_name) parts.push(record?.warehouse_name);
                    if (record?.room_name) parts.push(record?.room_name);
                    if (record?.rack_name) parts.push(record?.rack_name);
                    if (record?.layer_name) parts.push(record?.layer_name);
                    return parts.join(' > ');
                },
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                align: 'center',
                render: (status) => (
                    <Tag color={status === 'Good' ? 'green' : 'red'} style={{ fontWeight: 'bold' }}>
                        {status ? status.toUpperCase() : '-'}
                    </Tag>
                ),
            },
            {
                title: 'Stok',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
                render: (qty) => (
                    <Tag color="gold" style={{ fontWeight: 'bold' }}>
                        {qty}
                    </Tag>
                ),
            },
        ],
        [pagination],
    );

    return (
        <Card
            style={{
                background: '#f5faff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #1890ff11',
                marginBottom: 24,
            }}
        >
            <CustomTable<Storage>
                size="small"
                columns={columns}
                dataSource={pagination?.data}
                rowKey={(record, i) => `${record.product_id}-${i}`}
                onPaginationChange={handlePageChange}
                page={pagination?.current_page || 1}
            />
        </Card>
    );
}
