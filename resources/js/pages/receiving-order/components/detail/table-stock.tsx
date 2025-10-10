import { DateDisplay } from '@/components/displays/date-display';
import { Storage } from '@/types/storage.type';
import { Table, Tag, type TableProps } from 'antd';
import { useContext, useMemo } from 'react';
import { DetailContext } from '../../detail';

export function StockTable() {
    const { availableStocks: data, detailsPagination: pagination } = useContext(DetailContext);

    const columns = useMemo<TableProps<Storage>['columns']>(
        () => [
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
                title: 'Inbound',
                dataIndex: 'inbound_at',
                key: 'inbound_at',
                align: 'center',
                render: (val) => <DateDisplay val={val} />,
            },
            {
                title: 'Nama Produk',
                dataIndex: 'product_name',
                key: 'product_name',
                align: 'left',
            },
            {
                title: 'Expired Date',
                dataIndex: 'expired_date',
                key: 'expired_date',
                align: 'center',
                render: (val) => <DateDisplay val={val} />,
            },
            {
                title: 'Stok',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
                render: (val) => (
                    <Tag color="blue" style={{ fontWeight: 'bold' }}>
                        {val}
                    </Tag>
                ),
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
        ],
        [pagination],
    );

    return (
        <Table<Storage>
            scroll={{ x: 'max-content' }}
            size="small"
            rowKey="product_id"
            dataSource={data ?? []}
            columns={columns}
            pagination={false}
            bordered
        />
    );
}
