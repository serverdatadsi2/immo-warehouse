import { AddButton } from '@/components/buttons/crud-buttons';
import { usePermission } from '@/hooks/use-permission';
import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { OutboundWithRelations } from '@/types/warehouse-outbound.type';
import { Head, router } from '@inertiajs/react';
import { Card, Col, Row, Typography } from 'antd';
import { TextCursorInput } from 'lucide-react';
import { useCallback } from 'react';
import { HeaderTable } from './components/header/table';

export default function Page({ pagination }: PageProps) {
    const { hasPermission } = usePermission();
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
                    {hasPermission('outbound.create') && (
                        <Col>
                            <AddButton
                                icon={<TextCursorInput />}
                                onClick={handleAdd}
                                style={{ fontWeight: 'bold', borderRadius: 8 }}
                            >
                                Manual Outbound
                            </AddButton>
                        </Col>
                    )}
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

type PageProps = {
    pagination: SimplePagination<OutboundWithRelations>;
};
