import { appendQueryString, formatDate } from '@/lib/utils';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Params, StoreOrderWithRelatons } from '@/types/outbound-qc.type';
import { router } from '@inertiajs/react';
import {
    Button,
    Card,
    Collapse,
    Divider,
    List,
    message,
    notification,
    Space,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import { PackagePlus } from 'lucide-react';
import { useCallback } from 'react';
import { Filters } from './filters';

const { Text, Title } = Typography;

interface Props {
    params: Params;
    pagination: LaravelPagination<StoreOrderWithRelatons>;
}

export function StoreOrderComponent({ params, pagination }: Props) {
    const handleUpdateStatus = useCallback((orderId: string) => {
        router.patch(
            route('packing.updateStatus', { order_id: orderId }),
            {},
            {
                onSuccess: () => {
                    message.success('Order berhasil packing ✅');
                },
                onError: (e) => {
                    notification.error({
                        message: 'Error',
                        description: e.message || 'Terjadi kesalahan saat memproses order.',
                        duration: 10,
                    });
                },
            },
        );
    }, []);

    const generateCollapseItems = useCallback(
        (order: StoreOrderWithRelatons) => [
            {
                key: order.id.toString(),
                label: (
                    <Space>
                        <Title level={5} style={{ margin: 0 }}>
                            {order.store.name}
                        </Title>
                        <Divider type="vertical" className="border border-gray-500" />
                        <Text strong>Order: {order.order_number}</Text>
                        <Divider type="vertical" className="border border-gray-500" />
                        <Text type="secondary">
                            Approved:{' '}
                            <span style={{ color: '#1890ff' }}>
                                {formatDate(order.approved_at)}
                            </span>
                        </Text>
                        <Divider type="vertical" className="border border-gray-500" />
                        <Tag
                            color={order.status === 'processing' ? 'blue' : 'green'}
                            // icon={statusIcon(order.status)}
                        >
                            {order.status.toUpperCase()}
                        </Tag>
                    </Space>
                ),
                extra: (
                    <Space>
                        <Tooltip title="Packing Order">
                            <Button
                                icon={<PackagePlus size={18} />}
                                type="primary"
                                size="middle"
                                style={{ fontWeight: 'bold', boxShadow: '0 2px 8px #1890ff33' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(order?.id);
                                }}
                            >
                                Packing
                            </Button>
                        </Tooltip>
                    </Space>
                ),
                children: (
                    <List
                        size="small"
                        dataSource={order.details}
                        renderItem={(item, i) => (
                            <List.Item
                                style={{
                                    padding: '8px 0 8px 24px',
                                    background: i % 2 === 0 ? '#fafafa' : '#fff',
                                    borderRadius: 6,
                                    transition: 'background 0.2s',
                                }}
                                className="hover:bg-blue-50"
                            >
                                <List.Item.Meta
                                    title={
                                        <div className="flex justify-between max-w-2xl">
                                            <Space>
                                                <Text strong>{i + 1}.</Text>
                                                <Text>{item.product.name}</Text>
                                                <Text type="secondary">({item.product.code})</Text>
                                            </Space>
                                            <Text type="secondary">
                                                Quantity:{' '}
                                                <span
                                                    style={{ color: '#1890ff', fontWeight: 'bold' }}
                                                >
                                                    {item.approved_qty}
                                                </span>
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ),
            },
        ],
        [handleUpdateStatus],
    );

    return (
        <>
            <Filters params={params} />
            <Card
                className="!mr-4"
                style={{
                    background: '#f5faff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #1890ff11',
                    marginBottom: 24,
                }}
            >
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
                                style={{
                                    width: '100%',
                                    background: '#f5faff',
                                    boxShadow: '0 2px 8px #1890ff11',
                                    border: 'solid 1px #1890ff33',
                                }}
                                bordered={false}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </>
    );
}
