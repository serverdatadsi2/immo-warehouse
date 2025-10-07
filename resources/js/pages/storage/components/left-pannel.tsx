import { DateDisplay } from '@/components/displays/date-display';
import { UnsignProductLocation } from '@/types/storage.type';
import { Card, Divider, Empty, List, Space, Typography } from 'antd';

const { Text } = Typography;
const { Meta } = Card;

interface Props {
    data: UnsignProductLocation[];
}

export function LeftPannel({ data }: Props) {
    return (
        <Card>
            <Meta
                style={{
                    margin: '-12px -12px 0 -12px',
                    padding: 10,
                }}
                title="Barang Menunggu Penempatan"
                description="List barang yang sudah siap ditempatkan di gudang"
            />
            <List
                size="small"
                dataSource={data}
                locale={{ emptyText: <Empty description="Belum ada barang ditempatkan" /> }}
                renderItem={(item, i) => (
                    <List.Item>
                        <List.Item.Meta
                            title={
                                <Space>
                                    <Text strong>{i + 1}.</Text>
                                    <Text>{item.product_name}</Text>
                                    {/* <Text type="secondary">({item.product_code})</Text> */}
                                </Space>
                            }
                            description={
                                <Space>
                                    <Text type="secondary">
                                        Inbound: <DateDisplay val={item.inbound_date} />
                                    </Text>
                                    <Divider type="vertical" className="border border-gray-600" />
                                    <Text type="secondary">Quantity: {item.quantity}</Text>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}
