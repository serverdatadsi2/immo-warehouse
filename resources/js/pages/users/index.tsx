import { AppLayout } from '@/layouts/app-layout';
import { User } from '@/types';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Head, Link } from '@inertiajs/react';
import { Button, Card, Popconfirm, Space, Table, TableColumnsType } from 'antd';

interface UsersIndexProps {
    users: User[];
}

interface UserTable {
    id: string;
    name: string;
    username: string;
    email: string;
    roles: string[];
    warehouses: Record<string, string>;
    ecommerce_access: boolean;
    wms_access: boolean;
    backoffice_access: boolean;
    store_access: boolean;
    created_at: string;
}

const columns: TableColumnsType<UserTable> = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
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
        render: (roles: string[]) => <span>{roles.join(', ')}</span>,
    },
    {
        title: 'Warehouses',
        dataIndex: 'warehouses',
        key: 'warehouses',
        render: (warehouses: Record<string, string>) => (
            <span>{Object.values(warehouses).join(', ')}</span>
        ),
    },
    {
        title: 'Ecommerce Access',
        dataIndex: 'ecommerce_access',
        key: 'ecommerce_access',
        render: (access: boolean) => <span>{access ? 'Yes' : 'No'}</span>,
    },
    {
        title: 'WMS Access',
        dataIndex: 'wms_access',
        key: 'wms_access',
        render: (access: boolean) => <span>{access ? 'Yes' : 'No'}</span>,
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
            <Space size="middle">
                <Link href={route('users.edit', record.id)}>
                    <Button type="primary" icon={<EditOutlined />} size="small">
                        Edit
                    </Button>
                </Link>
                <Popconfirm
                    title="Delete the user"
                    description="Are you sure to delete this user?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleDelete(record.id)}
                >
                    <Button danger icon={<DeleteOutlined />} size="small">
                        Delete
                    </Button>
                </Popconfirm>
            </Space>
        ),
    },
];

const handleDelete = (id: string) => {
    // Using Inertia to make a DELETE request to the user endpoint
    fetch(route('users.destroy', id), {
        method: 'DELETE',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN':
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
    }).then(() => {
        // Refresh the page after deletion
        window.location.reload();
    });
};

export default function usersindex({ users }: UsersIndexProps) {
    return (
        <AppLayout navBarTitle="Manage system users">
            <Head title="Users" />

            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Link href={route('users.create')}>
                        <Button type="primary" icon={<PlusOutlined />}>
                            Create New User
                        </Button>
                    </Link>
                </div>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </AppLayout>
    );
}
