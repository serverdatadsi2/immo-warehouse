import { useDebounce } from '@/hooks/use-debounce';
import { appendQueryString, formatDate } from '@/lib/utils';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Params, StoreOrderWithRelatons } from '@/types/outbound-qc.type';
import { SearchOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Card, Collapse, Divider, Input, List, Space, Tag, Typography } from 'antd';
import { useCallback, useState } from 'react';

const { Text } = Typography;

interface Props {
    params: Params;
    pagination: LaravelPagination<StoreOrderWithRelatons>;
}

export function StoreOrderComponent({ params, pagination }: Props) {
    const [search, setSearch] = useState(params.search || '');

    const debounce = useDebounce((val: string) => {
        router.get(appendQueryString('search', val));
    }, 300);

    const handleSearch = useCallback(
        (val: string) => {
            setSearch(val);
            debounce(val);
        },
        [debounce],
    );

    const generateCollapseItems = useCallback((order: StoreOrderWithRelatons) => {
        return [
            {
                key: order.id.toString(),
                label: (
                    <Space>
                        <Text strong>{order.store.name}</Text>
                        <Divider type="vertical" />
                        <span className="text-[10px] text-gray-400">{order.order_number}</span>
                        <Divider type="vertical" />
                        <Text type="secondary">{formatDate(order.approved_at)}</Text>
                    </Space>
                ),
                extra: <Tag color="blue">{order.status}</Tag>,
                children: (
                    <List
                        size="small"
                        dataSource={order.details}
                        renderItem={(item, i) => (
                            <List.Item style={{ padding: '0 0 0 16px' }}>
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <Text>{i + 1}.</Text>
                                            <Text>{item.product.name}</Text>
                                            <Divider type="vertical" />
                                            <Text type="secondary">Qty: {item.approved_qty}</Text>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ),
            },
        ];
    }, []);
    return (
        <Card className="!mr-4">
            <Card.Meta title="Store Order" />
            <Input
                allowClear
                suffix={<SearchOutlined />}
                value={search}
                className="!mt-5"
                placeholder="Cari nomor order, atau store..."
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: 8 }}
            />

            <List
                dataSource={pagination.data}
                size="small"
                pagination={{
                    pageSize: pagination.per_page,
                    size: 'small',
                    align: 'center',
                    onChange: (page) => {
                        router.get(appendQueryString('page', page.toString()));
                    },
                    total: pagination.total,
                    current: pagination.current_page,
                }}
                renderItem={(order) => (
                    <List.Item style={{ border: 'none', padding: 0 }}>
                        <Collapse
                            items={generateCollapseItems(order)}
                            accordion
                            style={{ width: '100%' }}
                            bordered={false}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}
