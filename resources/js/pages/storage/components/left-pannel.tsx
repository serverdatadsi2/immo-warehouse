import { Card, Empty, List, Space, Typography } from 'antd';

const { Text } = Typography;
const { Meta } = Card;

export function LeftPannel({ storageData }: { storageData: any[] }) {
    return (
        <Card size="small">
            <Meta
                style={{
                    borderRadius: 4,
                    margin: '-12px -12px 0 -12px',
                    padding: 10,
                }}
                title="Data Storage Gudang"
                description="List barang yang sudah ditempatkan"
            />
            <List
                size="small"
                dataSource={storageData}
                locale={{ emptyText: <Empty description="Belum ada barang ditempatkan" /> }}
                renderItem={(item, i) => (
                    <List.Item>
                        <List.Item.Meta
                            title={
                                <Space>
                                    <Text strong>{i + 1}.</Text>
                                    <Text>{item.name}</Text>
                                    <Text type="secondary">({item.id})</Text>
                                </Space>
                            }
                            description={
                                <Text type="secondary">
                                    Lokasi: {item.location} | RFID: {item.rfid}
                                </Text>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}
