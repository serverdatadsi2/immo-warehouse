import { usePermission } from '@/hooks/use-permission';
import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Role } from '@/types/role.type';
import { PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { Button, Card, Col, Row, Typography } from 'antd';
import { useCallback } from 'react';
import DataTable from './components/table';

interface Props {
    pagination: SimplePagination<Role>;
}

const { Title, Text } = Typography;

export default function Page({ pagination }: Props) {
    const { hasPermission } = usePermission();
    const handleAdd = useCallback(() => {
        router.get('/system/roles/create');
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
                    {hasPermission('role.create') && (
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
                    )}
                </Row>
            </Card>

            <DataTable pagination={pagination} />
        </AppLayout>
    );
}
