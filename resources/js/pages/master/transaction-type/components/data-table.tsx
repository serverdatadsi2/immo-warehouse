import { appendQueryString } from '@/lib/utils';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { EditOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Pagination, Space, Table } from 'antd';
import { useCallback, useMemo } from 'react';
import { Item } from '..';

export function DataTable({ pagination, onAction }: Props) {
    const columns = useMemo(
        (): TableProps<Item>['columns'] => [
            {
                title: 'Id',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: Item, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Code',
                dataIndex: 'code',
                key: 'code',
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
            },
            {
                title: 'Action',
                key: 'action',
                fixed: 'right',
                render: (_, d) => <Button onClick={() => onAction(d)} icon={<EditOutlined />} />,
            },
        ],
        [onAction, pagination?.current_page, pagination?.per_page],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Table<Item>
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
    pagination: LaravelPagination<Item> | undefined;
    onAction: (d: Item) => void;
};
