import { AppLayout } from '@/layouts/app-layout';
import { LowStock } from '@/types/dashboard.type';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Storage } from '@/types/storage.type';
import {
    BarcodeOutlined,
    EnvironmentOutlined,
    InboxOutlined,
    LineChartOutlined,
} from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Card, Col, Row, Space, Statistic } from 'antd';
import ChartTrend from './components/chart';
import TableLocation from './components/table';
import TableStockBarier from './components/table-low-stock';

interface Props {
    stockBarier: LowStock[];
    pagination: SimplePagination<Storage>;
    chartData: any[];
    summary: any;
}

export default function Dashboard({ pagination, stockBarier, chartData, summary }: Props) {
    return (
        <AppLayout navBarTitle="Dashboard">
            <Head title="Dashboard" />
            <Space direction="vertical" size="large" className="w-full">
                <Row gutter={[16, 16]} className="mt-4">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Items"
                                value={summary.item}
                                prefix={<InboxOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Stock"
                                value={summary.available_stock}
                                prefix={<LineChartOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Locations"
                                value={summary.location}
                                prefix={<EnvironmentOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Active RFID Tags"
                                value={summary.active_rfid}
                                prefix={<BarcodeOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <ChartTrend data={chartData} />
                {stockBarier.length > 0 && <TableStockBarier data={stockBarier} />}

                <TableLocation pagination={pagination} />
            </Space>
        </AppLayout>
    );
}
