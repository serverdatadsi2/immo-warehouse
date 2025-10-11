import { AddButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Outbound } from '@/types/outbound.type';
import { Head, router } from '@inertiajs/react';
import { Card, Col, Row, Typography } from 'antd';
import { useCallback } from 'react';
import { HeaderTable } from './components/header/table';

export default function Page({ pagination }: PageProps) {
    const handleAdd = useCallback(() => {
        router.get('/outbound/detail');
    }, []);

    return (
        <AppLayout navBarTitle="Outbound">
            <Head title="Outbound" />
            <Card
                style={{
                    background: '#f5faff',
                    boxShadow: '0 2px 8px #1890ff11',
                }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Typography.Title level={4} style={{ color: '#1890ff', marginBottom: 0 }}>
                            Daftar Outbound
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            Monitoring data outbound barang dari gudang.
                        </Typography.Text>
                    </Col>
                    <Col>
                        <AddButton
                            onClick={handleAdd}
                            style={{ fontWeight: 'bold', borderRadius: 8 }}
                        >
                            Add Outbound
                        </AddButton>
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

export type HeaderItem = Outbound;

type PageProps = {
    pagination: LaravelPagination<HeaderItem>;
};
