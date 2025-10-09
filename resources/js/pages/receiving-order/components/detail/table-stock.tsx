import { DateDisplay } from '@/components/displays/date-display';
import { Storage } from '@/types/storage.type';
import { Card, Table, Tag, type TableProps } from 'antd';
import { useContext, useMemo } from 'react';
import { DetailContext } from '../../detail';

export function StockTable() {
    const { availableStocks: data, detailsPagination: pagination } = useContext(DetailContext);

    const columns = useMemo(
        (): TableProps<Storage>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
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
                render: (val) => <DateDisplay val={val} />,
            },
            {
                title: 'Nama',
                dataIndex: 'product_name',
                key: 'product_name',
            },
            {
                title: 'Expired Date',
                dataIndex: 'expired_date',
                key: 'expired_date',
                render: (val) => <DateDisplay val={val} />,
            },
            {
                title: 'Stok',
                dataIndex: 'quantity',
                key: 'quantity',
                render: (val) => <Tag color="blue">{val}</Tag>,
            },
            {
                title: 'Lokasi Barang',
                key: 'location',
                dataIndex: 'location',
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
        <Card className="!border-green-200 !mt-7 shadow-green-200 !shadow-md">
            <Card.Meta title="Available Stock" className="text-center" />
            <div className="!mt-5 border rounded !border-amber-200 shadow-amber-200 shadow-sm">
                <Table<Storage>
                    scroll={{ x: 'max-content' }}
                    size="small"
                    rowKey="product_id"
                    dataSource={data ?? []}
                    columns={columns}
                    pagination={false}
                />
            </div>
        </Card>
    );
}
