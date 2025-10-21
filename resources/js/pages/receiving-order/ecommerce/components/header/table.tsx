import { DateDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Card, Space, Tag, Tooltip, Typography } from 'antd';
import { LayoutList } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { HeaderItem } from '../../';

const { Title } = Typography;

export function HeaderTable({ pagination }: Props) {
    const handleAction = useCallback((val: HeaderItem) => {
        router.get(`/receiving-order/ecommerce-order/detail?headerId=${val.id}`);
    }, []);

    const columns = useMemo<TableProps<HeaderItem>['columns']>(
        () => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: HeaderItem, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Nomor Order',
                dataIndex: 'order_number',
                key: 'order_number',
                align: 'center',
            },
            {
                title: 'Order By',
                dataIndex: 'order_by',
                key: 'order_by',
                align: 'center',
            },
            {
                title: 'Approve',
                children: [
                    {
                        title: 'By',
                        dataIndex: 'approved_name',
                        key: 'approved_name',
                        align: 'center',
                    },
                    {
                        title: 'Date',
                        dataIndex: 'approve_at',
                        key: 'approve_at',
                        render: (v) => <DateDisplay val={v} />,
                        align: 'center',
                    },
                ],
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                align: 'center',
                render: (v) => renderOrderStatusTag(v),
            },
            {
                title: 'Aksi',
                key: 'action',
                fixed: 'right',
                align: 'center',
                render: (_, d) => (
                    <Tooltip title="Lihat Detail">
                        <Button
                            onClick={() => handleAction(d)}
                            icon={<LayoutList size={18} />}
                            type="primary"
                            style={{ borderRadius: 8, fontWeight: 'bold' }}
                        />
                    </Tooltip>
                ),
            },
        ],
        [handleAction, pagination?.current_page, pagination?.per_page],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <Card
            style={{
                background: '#f5faff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #1890ff11',
                marginBottom: 24,
            }}
        >
            <Title level={5} style={{ color: '#1890ff', marginBottom: 8 }}>
                Daftar Receiving Order
            </Title>
            <Space direction="vertical" className="w-full">
                <CustomTable<HeaderItem>
                    size="small"
                    rowKey="id"
                    columns={columns}
                    bordered
                    dataSource={pagination?.data}
                    className="max-w-full"
                    scroll={{ x: 'max-content' }}
                    page={pagination?.current_page || 1}
                    onPaginationChange={handlePageChange}
                />
            </Space>
        </Card>
    );
}

type Props = {
    pagination: SimplePagination<HeaderItem> | undefined;
};

const renderOrderStatusTag = (status) => {
    let color;
    let text;

    const normalizedStatus = (status || '').toLowerCase();

    switch (normalizedStatus) {
        case 'paid':
            color = 'green';
            text = 'PAID';
            break;
        case 'received':
            color = 'blue';
            text = 'RECEIVED';
            break;
        case 'processed':
            color = 'gold';
            text = 'PROCESSING';
            break;
        case 'shipped':
            color = 'purple';
            text = 'SHIPPED';
            break;
        default:
            color = 'default';
            text = status ? status.toUpperCase() : 'UNKNOWN';
    }

    return (
        <Tag color={color} style={{ fontWeight: 'bold', fontSize: 13 }} key={status}>
            {text}
        </Tag>
    );
};
