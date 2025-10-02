import { Button, Card, Col, Empty, List, Row, Typography, message } from 'antd';

const { Text } = Typography;
const { Meta } = Card;

// Simulasi data produk
const dummyItems = [
    { id: 'PRD-001', name: 'Shampoo Herbal' },
    { id: 'PRD-002', name: 'Sabun Cair' },
    { id: 'PRD-003', name: 'Face Wash' },
    { id: 'PRD-004', name: 'Body Lotion' },
    { id: 'PRD-005', name: 'Hair Oil' },
];

// Generator RFID sederhana
const generateRFID = () => 'RFID-' + Math.floor(Math.random() * 1000000) + '-' + Date.now();

export function RightPannel({
    scannedLocation,
    setScannedLocation,
    scannedItems,
    setScannedItems,
    setStorageData,
}: any) {
    const handleScanLocation = () => {
        const location = 'Gudang A > Ruang 1 > Rak 01 > Layer A';
        setScannedLocation(location);
        message.success(`Lokasi ditetapkan: ${location}`);
    };

    const handleScanItems = () => {
        const items = dummyItems.map((item) => ({
            ...item,
            rfid: generateRFID(),
        }));
        setScannedItems(items);
        message.success(`${items.length} barang berhasil di-scan`);
    };

    const handleAssignAll = () => {
        if (!scannedLocation) {
            message.error('Lokasi belum di-scan!');
            return;
        }
        if (scannedItems.length === 0) {
            message.error('Belum ada barang yang di-scan!');
            return;
        }

        const newStorage = scannedItems.map((item: any) => ({
            ...item,
            location: scannedLocation,
        }));

        setStorageData((prev: any[]) => [...prev, ...newStorage]);
        setScannedItems([]);
        message.success(`${newStorage.length} barang berhasil ditempatkan`);
    };

    return (
        <Card
            actions={[
                <Button onClick={handleScanItems} disabled={!scannedLocation}>
                    Scan Barang
                </Button>,
                <Button
                    danger
                    onClick={() => setScannedItems([])}
                    disabled={scannedItems.length < 1}
                >
                    Clear
                </Button>,
                <Button type="primary" onClick={handleAssignAll} disabled={scannedItems.length < 1}>
                    Assign Semua
                </Button>,
            ]}
        >
            <Meta
                style={{
                    borderRadius: 4,
                    margin: '-12px -12px 0 -12px',
                    padding: 10,
                }}
                title="Barang Menunggu Penempatan"
                description="List barang hasil scan yang siap ditempatkan"
            />

            <Row>
                <Col span={19}>
                    <Text>Lokasi terpilih: </Text>
                    <Text strong>{scannedLocation ?? 'Belum scan lokasi'}</Text>
                </Col>
                <Col span={5}>
                    <Button type="primary" onClick={handleScanLocation}>
                        Scan Lokasi
                    </Button>
                </Col>
            </Row>

            <List
                size="small"
                dataSource={scannedItems}
                locale={{ emptyText: <Empty description="Belum ada barang di-scan" /> }}
                renderItem={(item: any, i: number) => (
                    <List.Item
                        actions={[
                            <Button
                                size="small"
                                danger
                                onClick={() =>
                                    setScannedItems((prev: any[]) =>
                                        prev.filter((x) => x.rfid !== item.rfid),
                                    )
                                }
                            >
                                Cancel
                            </Button>,
                        ]}
                    >
                        <List.Item.Meta
                            title={
                                <div className="flex gap-x-2">
                                    <Text>{i + 1}.</Text>
                                    <Text>{item.name}</Text>
                                    <Text type="secondary">RFID: {item.rfid}</Text>
                                </div>
                            }
                            description="Dalam antrian penempatan"
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}
