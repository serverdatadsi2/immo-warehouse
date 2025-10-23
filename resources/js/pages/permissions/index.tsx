import { AppLayout } from '@/layouts/app-layout';
import { Permission } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, Table, TableColumnsType } from 'antd';

interface PermissionsIndexProps {
    permissions: Permission[];
}

interface PermissionTable {
    id: string;
    name: string;
    guard_name: string;
    created_at: string;
}

const columns: TableColumnsType<PermissionTable> = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Guard Name',
        dataIndex: 'guard_name',
        key: 'guard_name',
    },
    {
        title: 'Created At',
        dataIndex: 'created_at',
        key: 'created_at',
    },
];

export default function permissionsindex({ permissions }: PermissionsIndexProps) {
    return (
        <AppLayout navBarTitle="List of all available permissions">
            <Head title="Permissions" />
            <Card>
                <Table
                    columns={columns}
                    dataSource={permissions}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </AppLayout>
    );
}
