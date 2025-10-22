import { InboundQcSummary } from '@/types/inbound-qc.type';
import { Card, Col, Row, Statistic } from 'antd';

interface Props {
    data: InboundQcSummary | undefined;
}

export default function SummaryCard({ data }: Props) {
    return (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
                <Card className="!bg-gray-50">
                    <Statistic title="Total Item Diperiksa" value={data?.grand_total} />
                </Card>
            </Col>
            <Col span={6}>
                <Card className="!bg-gray-100">
                    <Statistic title="Kondisi Baik" value={data?.good_qty} />
                </Card>
            </Col>
            <Col span={6}>
                <Card className="!bg-gray-100">
                    <Statistic title="Kondisi Buruk" value={data?.bad_dty} />
                </Card>
            </Col>
            <Col span={6}>
                <Card className="!bg-gray-100">
                    <Statistic
                        title="Kondisi Buruk Tertinggi"
                        value={
                            data?.highestBadProduct?.percentage
                                ? `${data?.highestBadProduct.product_name} (${data?.highestBadProduct.percentage} %)`
                                : '-'
                        }
                        valueStyle={{ fontSize: 16 }}
                    />
                </Card>
            </Col>
        </Row>
    );
}
