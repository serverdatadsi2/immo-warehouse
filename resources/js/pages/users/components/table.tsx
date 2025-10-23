import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { User } from '@/types';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { EditOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, Card, TableProps, Tag } from 'antd';
import { useCallback, useMemo } from 'react';

interface Props {
    pagination: SimplePagination<User>;
}

export default function DataTable({ pagination }: Props) {
    const handleAction = useCallback((id: string) => {
        router.get(`/users/${id}/edit`);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    const columns = useMemo(
        (): TableProps<User>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                width: 70,
                render: (_: any, __: User, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (name: string) => (
                    <strong className="text-gray-800 capitalize">{name}</strong>
                ),
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
            },
            {
                title: 'Roles',
                dataIndex: 'roles',
                key: 'roles',
                render: (roles: string[]) => {
                    if (!roles?.length) return <em className="text-gray-400">No roles</em>;

                    return (
                        <div className="flex flex-wrap gap-1">
                            {roles.map((r) => (
                                <Tag key={r} color="blue">
                                    {r.replaceAll('_', ' ')}
                                </Tag>
                            ))}
                        </div>
                    );
                },
            },
            {
                title: 'Warehouses',
                dataIndex: 'warehouses',
                key: 'warehouses',
                render: (warehouses: Record<string, string>) => {
                    const warehouseList = Object.values(warehouses);
                    if (!warehouseList.length)
                        return <em className="text-gray-400">No warehouse</em>;

                    return (
                        <div className="flex flex-wrap gap-1">
                            {warehouseList.map((w) => (
                                <Tag key={w} color="orange">
                                    {w}
                                </Tag>
                            ))}
                        </div>
                    );
                },
            },
            {
                title: 'Actions',
                key: 'actions',
                align: 'center',
                width: 80,
                render: (_, d) => (
                    <Button
                        onClick={() => handleAction(d.id)}
                        icon={<EditOutlined />}
                        type="primary"
                        shape="circle"
                        title="Edit user"
                    />
                ),
            },
        ],
        [handleAction, pagination?.current_page, pagination?.per_page],
    );

    return (
        <Card
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
                marginTop: 8,
            }}
        >
            <CustomTable<User>
                columns={columns}
                rowKey="id"
                size="small"
                dataSource={pagination?.data}
                onPaginationChange={handlePageChange}
                page={pagination?.current_page || 1}
            />
        </Card>
    );
}
