import { DateDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { HistoryInboundWithRelation, InboundDetailWithProduct } from '@/types/inbound.type';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Space, Table, Tag, Typography } from 'antd';
import { useCallback, useMemo } from 'react';

type Props = {
    pagination: SimplePagination<HistoryInboundWithRelation> | null;
};
const { Title, Text } = Typography;

export function HistoryTable({ pagination }: Props) {
    // 🧱 Column untuk Tabel Header (Utama)
    const columns = useMemo(
        (): TableProps<HistoryInboundWithRelation>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: HistoryInboundWithRelation, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Store Asal',
                dataIndex: 'store_name',
                key: 'store_name',
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
        ],
        [pagination?.current_page, pagination?.per_page],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <Space direction="vertical" className="w-full">
            <div className="text-center">
                <Title level={4} style={{ color: '#1890ff', marginBottom: 0 }}>
                    History Retur Barang dari Store
                </Title>
                <Text type="secondary">
                    Menampilkan riwayat pengembalian barang dari store yang telah diproses sebagai
                    inbound ke gudang.
                </Text>

                {/* <Divider style={{ margin: '12px 0' }} /> */}
            </div>
            <CustomTable<HistoryInboundWithRelation>
                size="small"
                rowKey="id"
                columns={columns}
                bordered
                expandable={{ expandedRowRender }}
                dataSource={pagination?.data}
                onPaginationChange={handlePageChange}
                page={pagination?.current_page || 1}
                pagination={false}
                className="max-w-full"
                scroll={{ x: 'max-content' }}
            />
        </Space>
    );
}

// 🧩 Column untuk Tabel Detail (Expandable)
const detailColumns: TableProps<InboundDetailWithProduct>['columns'] = [
    {
        title: 'No.',
        key: 'serial',
        align: 'center',
        render: (_: any, __: InboundDetailWithProduct, index: number) => index + 1,
    },
    {
        title: 'Nama Produk',
        dataIndex: ['product', 'name'],
        key: 'product_name',
        align: 'left',
    },
    {
        title: 'Jumlah',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
        render: (qty) => (
            <Tag color="blue" style={{ fontWeight: 'bold' }}>
                {qty}
            </Tag>
        ),
    },
    {
        title: 'Expired Date',
        dataIndex: 'expired_date',
        key: 'expired_date',
        align: 'center',
        render: (v) => <DateDisplay val={v} />,
    },
    {
        title: 'Catatan',
        dataIndex: 'note',
        key: 'note',
        align: 'left',
    },
];

// 🔄 Fungsi render tabel detail
const expandedRowRender = (record: HistoryInboundWithRelation) => {
    return (
        <Table<InboundDetailWithProduct>
            title={() => <Text strong>Detail History Inbound</Text>}
            size="small"
            rowKey="id"
            columns={detailColumns}
            dataSource={record.inbound_detail || []}
            pagination={false}
        />
    );
};
