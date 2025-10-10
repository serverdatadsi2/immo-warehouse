import { DateDisplay } from '@/components/displays/date-display';
import { UnsignProductLocation } from '@/types/storage.type';
import { Card, Divider, Empty, List, Space, Tag, Typography } from 'antd';

const { Text, Title } = Typography;
const { Meta } = Card;

interface Props {
    data: UnsignProductLocation[];
}

export function LeftPannel({ data }: Props) {
    return (
        <Card
            style={{
                background: '#f5faff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <Meta
                style={{
                    margin: '-12px -12px 0 -12px',
                    padding: 10,
                }}
                title={
                    <Title level={5} style={{ color: '#1890ff', marginBottom: 0 }}>
                        Barang Menunggu Penempatan
                    </Title>
                }
                description={
                    <Text type="secondary">List barang yang sudah siap ditempatkan di gudang</Text>
                }
            />
            <List
                size="small"
                dataSource={data}
                locale={{ emptyText: <Empty description="Belum ada barang ditempatkan" /> }}
                renderItem={(item, i) => (
                    <List.Item
                        style={{
                            background: i % 2 === 0 ? '#e6f7ff' : '#fff',
                            borderRadius: 8,
                            marginBottom: 4,
                        }}
                    >
                        <List.Item.Meta
                            title={
                                <div className="flex justify-between items-center">
                                    <Space>
                                        <Text strong>{i + 1}.</Text>
                                        <Text>{item.product_name}</Text>
                                        <Text type="secondary">({item.product_code})</Text>
                                    </Space>
                                    <Tag
                                        color={item.qc_type === 'inbound' ? 'green' : 'orange'}
                                        style={{ fontWeight: 'bold' }}
                                    >
                                        {item.qc_type.toUpperCase()} QC
                                    </Tag>
                                </div>
                            }
                            description={
                                <Space>
                                    <Text type="secondary">
                                        Inbound: <DateDisplay val={item.inbound_date} />
                                    </Text>
                                    <Divider type="vertical" className="border border-gray-600" />
                                    <Text type="secondary">
                                        Quantity:{' '}
                                        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                                            {item.quantity}
                                        </span>
                                    </Text>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}
