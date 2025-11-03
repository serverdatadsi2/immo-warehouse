import { DeadStock } from '@/types/dashboard.type';
import { EnvironmentOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Card, Table, TableProps, Tag } from 'antd';
import { useMemo } from 'react';

interface Props {
    data: DeadStock[] | null;
}
export default function DeadStockTable({ data }: Props) {
    const columns = useMemo(
        (): TableProps<DeadStock>['columns'] => [
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
                render: (_, record: DeadStock) => {
                    const parts: string[] = [];
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
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
                render: (qty) => (
                    <Tag color="gold" style={{ fontWeight: 'bold' }}>
                        {qty}
                    </Tag>
                ),
            },
            {
                title: 'Umur',
                dataIndex: 'months_in_warehouse',
                key: 'months_in_warehouse',
                // align: 'center',
                // render: (qty) => (
                //     <Tag color="gold" style={{ fontWeight: 'bold' }}>
                //         {qty}
                //     </Tag>
                // ),
            },
        ],
        [],
    );

    return (
        <Card className="!shadow-md !border-red-300 ">
            <Card.Meta
                title={
                    <span className="space-x-5">
                        <span>Dead Stock Product in Locations</span>
                        <span className="absolute rounded-full size-5 bg-red-300 opacity-75 animate-ping" />
                    </span>
                }
                description="Barang yang telah berada di gudang lebih dari 6 bulan tanpa perpindahan."
            />
            <Table<DeadStock>
                columns={columns}
                size="small"
                rowKey={(record, i) => `${record.product_id}-${i}`}
                pagination={false}
                dataSource={data ?? []}
                rowClassName="bg-red-200"
            />
        </Card>
    );
}
