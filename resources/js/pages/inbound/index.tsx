import { AppLayout } from '@/layouts/app-layout';
import { Inbound } from '@/types/inbound.type';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { Button, Card, Col, Row, Typography } from 'antd';
import { useCallback } from 'react';
import { HeaderTable } from './components/header/table';

const { Title, Text } = Typography;

export default function Page({ pagination }: PageProps) {
    const handleAdd = useCallback(() => {
        router.get('/inbounds/detail');
    }, []);

    return (
        <AppLayout navBarTitle="Inbound">
            <Head title="Inbound" />
            <Card
                style={{
                    background: '#f5faff',
                    boxShadow: '0 2px 8px #1890ff11',
                }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={4} style={{ color: '#1890ff', marginBottom: 0 }}>
                            Daftar Inbound
                        </Title>
                        <Text type="secondary">
                            Monitoring dan penambahan data inbound barang ke gudang.
                        </Text>
                    </Col>
                    <Col>
                        <Button
                            onClick={handleAdd}
                            type="primary"
                            icon={<PlusOutlined />}
                            style={{ fontWeight: 'bold', borderRadius: 8 }}
                        >
                            Add Inbound
                        </Button>
                    </Col>
                </Row>
            </Card>
            <Card
                style={{
                    background: '#f5faff',
                    marginTop: 24,
                    boxShadow: '0 2px 8px #1890ff11',
                }}
            >
                <HeaderTable pagination={pagination} />
            </Card>
        </AppLayout>
    );
}

export type HeaderItem = Inbound;

type PageProps = {
    pagination: LaravelPagination<HeaderItem>;
};
