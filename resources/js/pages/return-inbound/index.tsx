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
    const handleHistory = useCallback(() => {
        router.get('/inbounds/return-store/history');
    }, []);
    return (
        <AppLayout navBarTitle="Return Inbound">
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
                            Daftar Retur Store
                        </Title>
                        <Text type="secondary">
                            Monitoring data daftar tunggu retur inbound barang ke gudang.
                        </Text>
                    </Col>
                    <Col>
                        <Button icon={<HistoryOutlined />} type="primary" onClick={handleHistory}>
                            History Return Inbound
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

export type HeaderItem = ReturnStoreWithRelation;

type PageProps = {
    pagination: SimplePagination<HeaderItem>;
};
