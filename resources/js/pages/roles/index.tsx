import { AppLayout } from '@/layouts/app-layout';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Head, Link, router } from '@inertiajs/react';
import {
    Button,
    Card,
    Col,
    Popconfirm,
    Row,
    Space,
    Table,
    TableColumnsType,
    Typography,
} from 'antd';
import { useCallback } from 'react';

interface RolesIndexProps {
    roles: Role[];
}

interface Role {
    id: string;
    name: string;
    permissions: string[];
    created_at: string;
}

const columns: TableColumnsType<Role> = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Permissions',
        dataIndex: 'permissions',
        key: 'permissions',
        render: (permissions: string[]) => <span>{permissions.join(', ')}</span>,
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
            <Space size="middle">
                <Link href={route('roles.edit', record.id)}>
                    <Button type="primary" icon={<EditOutlined />} size="small">
                        Edit
                    </Button>
                </Link>
                <Popconfirm
                    title="Delete the role"
                    description="Are you sure to delete this role?"
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
    // Using Inertia to make a DELETE request to the role endpoint
    fetch(route('roles.destroy', id), {
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

const { Title, Text } = Typography;

export default function Page({ roles }: RolesIndexProps) {
    const handleAdd = useCallback(() => {
        router.get('/roles/create');
    }, []);

    return (
        <AppLayout navBarTitle="Roles">
            <Head title="Roles" />
            <Card
                style={{
                    background: '#f5faff',
                    boxShadow: '0 2px 8px #1890ff11',
                }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={4} style={{ color: '#1890ff', marginBottom: 0 }}>
                            Daftar Hak Akses
                        </Title>
                        <Text type="secondary">Manage hak akses dan permissions.</Text>
                    </Col>
                    <Col>
                        <Button
                            onClick={handleAdd}
                            type="primary"
                            icon={<PlusOutlined />}
                            style={{ fontWeight: 'bold', borderRadius: 8 }}
                        >
                            Create New Role
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card
                style={{
                    background: '#f5faff',
                    boxShadow: '0 2px 8px #1890ff11',
                    marginTop: 20,
                }}
            >
                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </AppLayout>
    );
}
