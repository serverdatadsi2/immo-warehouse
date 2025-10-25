import { usePermission } from '@/hooks/use-permission';
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
import { CheckCheck, HardDriveUpload, PackageCheck } from 'lucide-react';
import { useCallback } from 'react';
import { Filters } from './filters';

const { Text, Title } = Typography;

interface Props {
    params: Params;
    pagination: LaravelPagination<StoreOrderWithRelatons>;
}

export function StoreOrderComponent({ params, pagination }: Props) {
    const { hasPermission } = usePermission();
    const handleUpdateStatus = useCallback((orderId: string) => {
        router.patch(
            route('packing.store.updateStatus', { order_id: orderId }),
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

    const handleOutbound = useCallback((order: StoreOrderWithRelatons) => {
        router.get(`/outbound/detail?storeOrder=${order.id}&orderNumber=${order.order_number}`);
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
                            color={
                                order.status === 'processing'
                                    ? 'blue'
                                    : order.status === 'received'
                                      ? 'orange'
                                      : order.status === 'packing'
                                        ? 'green'
                                        : 'yellow'
                            }
                        >
                            {order.status.toUpperCase()}
                        </Tag>
                    </Space>
                ),
                extra: (
                    <Space>
                        {hasPermission('packing.store.process') && (
                            <Tooltip title="Packing Order">
                                <Button
                                    icon={
                                        order.status === 'packing' ? (
                                            <CheckCheck size={20} />
                                        ) : (
                                            <PackageCheck size={18} />
                                        )
                                    }
                                    type="primary"
                                    style={{
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px #1890ff33',
                                        // backgroundColor: 'green',
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateStatus(order?.id);
                                    }}
                                    disabled={order.status === 'packing'}
                                >
                                    {order.status === 'packing' ? 'Packing Done' : 'Packing'}
                                </Button>
                            </Tooltip>
                        )}
                        {order.status === 'packing' && hasPermission('outbound.create') && (
                            <Tooltip title="Outbound">
                                <Button
                                    icon={<HardDriveUpload size={20} />}
                                    type="primary"
                                    iconPosition="end"
                                    style={{
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px #ffe7ba',
                                        backgroundColor: '#ad4e00',
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOutbound(order);
                                    }}
                                >
                                    Outbound
                                </Button>
                            </Tooltip>
                        )}
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
        [handleOutbound, handleUpdateStatus, hasPermission],
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
