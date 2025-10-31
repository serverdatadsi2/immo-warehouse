import { OrderWithRelation } from '@/types/warehouse-outbound.type';
import { Card, Table, Tag, type TableProps } from 'antd';
import { useContext, useMemo } from 'react';
import { DetailContext } from '../../detail';

export function OrderTable() {
    const { order } = useContext(DetailContext);

    const columns = useMemo(
        (): TableProps<OrderWithRelation>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_, __, index: number) => index + 1,
            },
            { title: 'Product', dataIndex: ['product', 'name'], key: 'product.name' },
            {
                title: 'Qty',
                dataIndex: 'quantity',
                key: 'qty',
                render: (rfid) => <Tag color="blue">{rfid}</Tag>,
            },
        ],
        [],
    );

    return (
        <Card
            size="small"
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <Card.Meta title="Detail Order" />
            <Table<OrderWithRelation>
                rowKey="id"
                size="small"
                className="mt-3"
                columns={columns}
                dataSource={order ?? []}
                pagination={false}
            />
        </Card>
    );
}
