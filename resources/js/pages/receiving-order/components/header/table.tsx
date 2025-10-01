import { DateDisplay } from '@/components/displays/date-display';
import { appendQueryString } from '@/lib/utils';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Pagination, Space, Table, Tooltip } from 'antd';
import { LayoutList } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { HeaderItem } from '../..';

export function HeaderTable({ pagination }: Props) {
    const handleAction = useCallback((val: HeaderItem) => {
        router.get(`/receiving-order/detail?header_id=${val.id}`);
    }, []);

    const columns = useMemo(
        (): TableProps<HeaderItem>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
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
            },
            {
                title: 'Store',
                dataIndex: 'store_name',
                key: 'store_name',
            },
            {
                title: 'Approve',
                children: [
                    {
                        title: 'By',
                        dataIndex: 'approved_name',
                        key: 'approved_name',
                    },
                    {
                        title: 'Date',
                        dataIndex: 'approved_at',
                        key: 'approved_at',
                        render: (v) => <DateDisplay val={v} />,
                    },
                ],
            },
            {
                title: 'Action',
                key: 'action',
                fixed: 'right',
                render: (_, d) => (
                    <Tooltip title="View Detail">
                        <Button onClick={() => handleAction(d)} icon={<LayoutList size={20} />} />
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
        <Space direction="vertical" className="w-full">
            <Table<HeaderItem>
                size="small"
                rowKey="id"
                columns={columns}
                bordered
                dataSource={pagination?.data}
                pagination={false}
                className="max-w-full"
                scroll={{ x: 'max-content' }}
            />
            {pagination && (
                <Pagination
                    align="end"
                    current={pagination.current_page}
                    pageSize={pagination.per_page}
                    total={pagination.total}
                    onChange={handlePageChange}
                />
            )}
        </Space>
    );
}

type Props = {
    pagination: LaravelPagination<HeaderItem> | undefined;
};
