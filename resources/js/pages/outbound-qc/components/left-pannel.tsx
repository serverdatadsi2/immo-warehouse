import { useDebounce } from '@/hooks/use-debounce';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Divider, Input, List, Space, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';

const { Text } = Typography;
const { Panel } = Collapse;

// Dummy header + detail
const storeOrders = Array.from({ length: 26 }).map((_, i) => {
    const storeLetter = String.fromCharCode(65 + (i % 26)); // 65 = 'A'

    return {
        id: `ORDER-${i + 1}`,
        orderNumber: `SO/2025/${String(i + 1).padStart(6, '0')}`,
        store: `Store ${storeLetter}`,
        requestedAt: `${(i % 28) + 1}/10/2025`,
        status: i % 2 === 0 ? 'approved' : 'draft',
        details: [
            { id: `D-${i + 1}-1`, product: 'Shampoo Herbal', qty: 10 + i },
            { id: `D-${i + 1}-2`, product: 'Sabun Cair', qty: 5 + i },
        ],
    };
});

export function LeftPannel({ selectedOrder, setSelectedOrder }: any) {
    const [search, setSearch] = useState('');

    const debounce = useDebounce((val: string) => {
        setSearch(val);
    }, 300);

    // filter
    const filteredOrders = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return storeOrders;

        return storeOrders.filter((order) => {
            const orderNumber = order.orderNumber?.toLowerCase() || '';
            const store = order.store?.toLowerCase() || '';
            const details = Array.isArray(order.details) ? order.details : [];

            return (
                orderNumber.includes(term) ||
                store.includes(term) ||
                details.some((d) => (d.product?.toLowerCase() || '').includes(term))
            );
        });
    }, [search]);

    return (
        <Card>
            <Card.Meta title="Store Order" />
            <Input
                suffix={<SearchOutlined />}
                className="!mt-5"
                placeholder="Cari nomor order, atau store..."
                onChange={(e) => debounce(e.target.value)}
                style={{ marginBottom: 8 }}
            />

            <List
                dataSource={filteredOrders}
                pagination={{
                    pageSize: 7,
                    size: 'small',
                    align: 'center',
                }}
                renderItem={(order) => (
                    <List.Item style={{ border: 'none', padding: 0 }}>
                        <Collapse accordion style={{ width: '100%' }} bordered={false}>
                            <Panel
                                key={order.id}
                                header={
                                    <Space>
                                        <Tooltip title="Order By">
                                            <Text strong>{order.store}</Text>
                                        </Tooltip>
                                        <Divider type="vertical" />
                                        <Tooltip title="Tanggal Order">
                                            <Text type="secondary">{order.requestedAt}</Text>
                                        </Tooltip>
                                        <Divider type="vertical" />
                                        <Tooltip title="Nomor Order">
                                            <Text type="secondary">{order.orderNumber}</Text>
                                        </Tooltip>
                                    </Space>
                                }
                                extra={
                                    <Button
                                        type={selectedOrder?.id === order.id ? 'primary' : 'dashed'}
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOrder(order);
                                        }}
                                    >
                                        {selectedOrder?.id === order.id ? 'Selected' : 'Select'}
                                    </Button>
                                }
                                style={{
                                    backgroundColor:
                                        selectedOrder?.id === order.id ? '#d6e4ff' : '',
                                }}
                            >
                                <List
                                    size="small"
                                    dataSource={order.details}
                                    renderItem={(item, i) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={
                                                    <Space>
                                                        <Text>{i + 1}.</Text>
                                                        <Text>{item.product}</Text>
                                                        <Divider type="vertical" />
                                                        <Text type="secondary">
                                                            Qty: {item.qty}
                                                        </Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Panel>
                        </Collapse>
                    </List.Item>
                )}
            />
        </Card>
    );
}
