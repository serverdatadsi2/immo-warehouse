import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Role } from '@/types/role.type';
import { EditOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, Card, TableProps, Tag } from 'antd';
import { useCallback, useMemo } from 'react';

interface Props {
    pagination: SimplePagination<Role>;
}

export default function DataTable({ pagination }: Props) {
    const handleAction = useCallback((id: string) => {
        router.get(`/roles/${id}/edit`);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    const columns = useMemo(
        (): TableProps<Role>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                width: 70,
                render: (_: any, __: Role, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Role Name',
                dataIndex: 'name',
                key: 'name',
                render: (name: string) => (
                    <strong className="text-gray-800 capitalize">{name}</strong>
                ),
            },
            {
                title: 'Permissions',
                dataIndex: 'permissions',
                key: 'permissions',
                render: (permissions: string[]) => {
                    if (!permissions?.length)
                        return <em className="text-gray-400">No permissions</em>;

                    // tampilkan 3 pertama, sisanya dengan "and X more..."
                    const displayLimit = 9;
                    const visible = permissions.slice(0, displayLimit);
                    const hiddenCount = permissions.length - displayLimit;

                    return (
                        <div className="flex flex-wrap gap-1">
                            {visible.map((p) => (
                                <Tag key={p} color="orange">
                                    {p.replaceAll('_', ' ')}
                                </Tag>
                            ))}
                            {hiddenCount > 0 && <Tag color="green">+{hiddenCount} more</Tag>}
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
                        title="Edit role"
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
                marginTop: 20,
            }}
        >
            <CustomTable<Role>
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
