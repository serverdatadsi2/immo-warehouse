import { DateDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { usePermission } from '@/hooks/use-permission';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Card, Space, Tag, Tooltip, Typography } from 'antd';
import { MonitorCog } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { HeaderItem } from '../..';

const { Title } = Typography;

export function HeaderTable({ pagination }: Props) {
    const { hasPermission } = usePermission();
    const handleAction = useCallback((val: HeaderItem) => {
        router.get(`/stock-opname/monitoring?headerId=${val.id}`);
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
                title: 'Kode',
                dataIndex: 'code',
                key: 'code',
                align: 'center',
            },
            {
                title: 'Location',
                dataIndex: ['location', 'name'],
                key: 'location_id',
                align: 'center',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                align: 'center',
                render: (v) => renderStatusStockOpname(v),
            },
            {
                title: 'Created',
                dataIndex: 'created_at',
                key: 'created_at',
                align: 'center',
                render: (v) => <DateDisplay val={v} />,
            },
            {
                title: 'Complated',
                dataIndex: 'completed_at',
                key: 'completed_at',
                align: 'center',
                render: (v) => <DateDisplay val={v} />,
            },
            {
                title: 'Aksi',
                key: 'action',
                fixed: 'right',
                align: 'center',
                render: (_, d) =>
                    hasPermission('stock_opname.monitoring') && (
                        <Tooltip title="Monitoring">
                            <Button
                                onClick={() => handleAction(d)}
                                icon={<MonitorCog size={18} />}
                                type="primary"
                                style={{ borderRadius: 8, fontWeight: 'bold' }}
                            />
                        </Tooltip>
                    ),
            },
        ],
        [handleAction, pagination, hasPermission],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <Card
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
                marginBottom: 24,
            }}
        >
            <Title level={5} style={{ color: '#1890ff', marginBottom: 8 }}>
                Daftar Stock Opname
            </Title>
            <Space direction="vertical" className="w-full">
                <CustomTable<HeaderItem>
                    size="small"
                    rowKey="id"
                    columns={columns}
                    bordered
                    dataSource={pagination?.data}
                    onPaginationChange={handlePageChange}
                    page={pagination?.current_page || 1}
                    className="max-w-full"
                    scroll={{ x: 'max-content' }}
                />
            </Space>
        </Card>
    );
}

type Props = {
    pagination: SimplePagination<HeaderItem> | undefined;
};

export const renderStatusStockOpname = (status) => {
    let color;
    let text;

    const normalizedStatus = (status || '').toLowerCase();

    switch (normalizedStatus) {
        case 'in_progress':
            color = 'green';
            text = 'IN GROGRESS';
            break;
        case 'completed':
            color = 'gold';
            text = 'COMPLETED';
            break;
        case 'draft':
            color = 'purple';
            text = 'DRAFT';
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
