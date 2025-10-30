import { LowStock } from '@/types/dashboard.type';
import { QrcodeOutlined } from '@ant-design/icons';
import { Card, Table, TableProps, Tag } from 'antd';
import { useMemo } from 'react';

interface Props {
    data: LowStock[];
}
export default function TableLowStock({ data }: Props) {
    const columns = useMemo(
        (): TableProps<LowStock>['columns'] => [
            {
                title: 'SKU',
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
                title: 'Kategory',
                dataIndex: 'product_category',
                key: 'product_category',
            },
            {
                title: 'Unit',
                dataIndex: 'unit_name',
                key: 'unit_name',
            },
            {
                title: 'Stock',
                dataIndex: 'stock',
                key: 'stock',
            },
            {
                title: 'Barier',
                dataIndex: 'stock_barrier',
                key: 'stock_barrier',
            },
            {
                title: 'Selisih',
                key: 'selisih',
                render: (_, d) => <Tag color="#f5222d">{d.stock - d.stock_barrier}</Tag>,
            },
            {
                title: 'Status',
                dataIndex: 'status_level',
                key: 'status',
                render: (v) => (v === 'WARNING' ? '⚠️' : '‼️') + v,
            },
        ],
        [],
    );

    return (
        <Card className="!shadow-md !border-yellow-400 ">
            <Card.Meta
                title={
                    <span className="space-x-5">
                        <span>Low Stock Warning</span>
                        <span className="absolute rounded-full size-5 bg-yellow-400 opacity-75 animate-ping" />
                    </span>
                }
                description="Stock has reached its limit. Please review and contact the head office to reorder from the supplier if needed."
            />

            <Table<LowStock>
                columns={columns}
                size="small"
                pagination={false}
                dataSource={data}
                rowKey={(record, i) => `${record.product_id}-${i}`}
                rowClassName={(d) =>
                    d.status_level === 'CRITICAL' ? 'bg-red-200' : 'bg-yellow-200'
                }
            />
        </Card>
    );
}
