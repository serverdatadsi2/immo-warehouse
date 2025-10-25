import { usePermission } from '@/hooks/use-permission';
import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { ReturnStoreWithRelation } from '@/types/return-store.type';
import { HistoryOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { Button, Card, Col, Row, Typography } from 'antd';
import { useCallback } from 'react';
import { HeaderTable } from './components/header/table';

const { Title, Text } = Typography;

export default function Page({ pagination }: PageProps) {
    const { hasPermission } = usePermission();

    const handleHistory = useCallback(() => {
        router.get('/inbounds/return-store/history');
    }, []);
    return (
        <AppLayout navBarTitle="Return Inbound">
            <Head title="Inbound" />
            <Card
                style={{
                    background: '#fff7e6',
                    boxShadow: '0 2px 8px #fffbe6',
                }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={4} style={{ color: '#1890ff', marginBottom: 0 }}>
                            Daftar Retur Store
                        </Title>
                        <Text type="secondary">
                            Monitoring data daftar tunggu retur inbound barang ke gudang.
                        </Text>
                    </Col>
                    {hasPermission('inbound.return.history') && (
                        <Col>
                            <Button
                                icon={<HistoryOutlined />}
                                type="primary"
                                onClick={handleHistory}
                            >
                                History Return Inbound
                            </Button>
                        </Col>
                    )}
                </Row>
            </Card>
            <Card
                style={{
                    background: '#fff7e6',
                    boxShadow: '0 2px 8px #fffbe6',
                    marginTop: 24,
                }}
            >
                <HeaderTable pagination={pagination} />
            </Card>
        </AppLayout>
    );
}

type PageProps = {
    pagination: SimplePagination<ReturnStoreWithRelation>;
};
