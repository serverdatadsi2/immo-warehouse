import { AppLayout } from '@/layouts/app-layout';
import { User } from '@/types';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { Button, Card, Col, Row, Typography } from 'antd';
import { useCallback } from 'react';
import DataTable from './components/table';
interface Props {
    pagination: SimplePagination<User>;
}

// const handleDelete = (id: string) => {
//     // Using Inertia to make a DELETE request to the user endpoint
//     fetch(route('users.destroy', id), {
//         method: 'DELETE',
//         headers: {
//             'X-Requested-With': 'XMLHttpRequest',
//             'X-CSRF-TOKEN':
//                 document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
//         },
//     }).then(() => {
//         // Refresh the page after deletion
//         window.location.reload();
//     });
// };
const { Title, Text } = Typography;

export default function Page({ pagination }: Props) {
    const handleAdd = useCallback(() => {
        router.get('/users/create');
    }, []);
    return (
        <AppLayout navBarTitle="Manage system users">
            <Head title="Users" />

            <Card
                style={{
                    background: '#f5faff',
                    boxShadow: '0 2px 8px #1890ff11',
                }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={4} style={{ color: '#1890ff', marginBottom: 0 }}>
                            Daftar Semua User
                        </Title>
                        <Text type="secondary">Manage user dan hak akses user.</Text>
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
            <DataTable pagination={pagination} />
        </AppLayout>
    );
}
