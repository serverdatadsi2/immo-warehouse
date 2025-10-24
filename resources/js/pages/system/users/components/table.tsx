import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { User } from '@/types/user.type';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, Card, Col, Row, TableProps, Tag, Typography } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { FormModal } from './form';
interface Props {
    pagination: SimplePagination<User>;
}

const { Title, Text } = Typography;

export default function DataTable({ pagination }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<User>();

    const handleAction = useCallback((item: User) => {
        setSelectedItem(item);
        setFormOpen(true);
    }, []);

    const handleFormClose = useCallback(() => {
        setFormOpen(false);
        setSelectedItem(undefined);
    }, []);

    const handleAdd = useCallback(() => {
        setSelectedItem(undefined);
        setFormOpen(true);
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
                width: 40,
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
                title: 'Role',
                dataIndex: 'role',
                key: 'role',
                render: (v) => <Tag color="blue">{v}</Tag>,
            },
            {
                title: 'Warehouse',
                dataIndex: 'warehouse',
                key: 'warehouse',
                render: (v) => <Tag color="orange">{v?.name}</Tag>,
            },
            {
                title: 'Actions',
                key: 'actions',
                align: 'center',
                width: 80,
                render: (_, d) => (
                    <Button
                        onClick={() => handleAction(d)}
                        icon={<EditOutlined />}
                        type="primary"
                        // shape="circle"
                        title="Edit user"
                    />
                ),
            },
        ],
        [handleAction, pagination?.current_page, pagination?.per_page],
    );

    return (
        <>
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
                            Create New User
                        </Button>
                    </Col>
                </Row>
            </Card>

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

                <FormModal open={formOpen} existingData={selectedItem} onClose={handleFormClose} />
            </Card>
        </>
    );
}
