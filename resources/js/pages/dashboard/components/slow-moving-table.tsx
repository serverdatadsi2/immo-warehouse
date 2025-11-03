import { SlowMoving } from '@/types/dashboard.type';
import { EnvironmentOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Card, Table, TableProps, Tag } from 'antd';
import { useMemo } from 'react';

interface Props {
    data: SlowMoving[] | null;
}
export default function SlowMovingTable({ data }: Props) {
    const columns = useMemo(
        (): TableProps<SlowMoving>['columns'] => [
            {
                title: 'Code',
                dataIndex: 'product_code',
                key: 'product_code',
                render: (text) => (
                    <Tag icon={<QrcodeOutlined />} color="blue">
                        {text}
                    </Tag>
                ),
            },
            {
                title: 'Product',
                dataIndex: 'product_name',
                key: 'product_name',
            },
            {
                title: 'Location',
                dataIndex: 'location',
                key: 'location',
                render: (_, record: SlowMoving) => {
                    const parts: string[] = [];
                    // if (record?.warehouse_name) parts.push(record?.warehouse_name);
                    if (record?.room_name) parts.push(record?.room_name);
                    if (record?.rack_name) parts.push(record?.rack_name);
                    if (record?.layer_name) parts.push(record?.layer_name);

                    return (
                        <Tag icon={<EnvironmentOutlined />} color="green">
                            {parts.join(' 🔷 ')}
                        </Tag>
                    );
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
        [],
    );

    return (
        <Card className="!shadow-md !border-yellow-400 ">
            <Card.Meta
                title={
                    <span className="space-x-5">
                        <span>Slow Moving Product in Locations</span>
                        <span className="absolute rounded-full size-5 bg-yellow-400 opacity-75 animate-ping" />
                    </span>
                }
                description="Barang yang telah berada di gudang lebih dari 3 bulan dan kurang dari 6 bulan tanpa perpindahan."
            />
            <Table<SlowMoving>
                columns={columns}
                size="small"
                rowKey={(record, i) => `${record.product_id}-${i}`}
                pagination={false}
                dataSource={data ?? []}
                rowClassName="bg-yellow-200"
            />
        </Card>
    );
}
