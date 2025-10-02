import { Button, Card, Empty, List, message, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;
const { Meta } = Card;

// Dummy gudang (dengan expired date)
const storageData = [
    ...Array.from({ length: 20 }).map((_, i) => ({
        id: 'PRD-001',
        name: 'Shampoo Herbal',
        rfid: `RFID-SHAMPOO-${i + 1}`,
        expired: `2025-10-${(i % 28) + 1}`,
    })),
    ...Array.from({ length: 100 }).map((_, i) => ({
        id: 'PRD-002',
        name: 'Sabun Cair',
        rfid: `RFID-SABUN-${i + 1}`,
        expired: `2025-11-${(i % 28) + 1}`,
    })),
];

export function RightPannel({ selectedOrder }: any) {
    const [scannedItems, setScannedItems] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const handleScanFIFO = () => {
        if (!selectedOrder) return;

        let results: any[] = [];

        // loop semua detail order
        selectedOrder.details.forEach((detail: any) => {
            // ambil stok sesuai product name (atau id kalau sudah pakai mapping)
            const candidates = storageData
                .filter((s) => s.name === detail.product) // 🔑 pakai product name
                .sort((a, b) => new Date(a.expired).getTime() - new Date(b.expired).getTime())
                .slice(0, detail.qty); // ambil sesuai qty request

            results = [...results, ...candidates];
        });

        setScannedItems(results);
        setCurrentPage(1);
        message.success(`${results.length} barang discan untuk order ${selectedOrder.orderNumber}`);
    };

    const handleConfirmQC = () => {
        if (scannedItems.length === 0) {
            message.error('Belum ada barang discan!');
            return;
        }
        message.success('QC outbound berhasil, barang siap masuk staging!');
        setScannedItems([]);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (selectedOrder) setScannedItems([]);
    }, [selectedOrder]);

    return (
        <Card
            actions={[
                <Button type="primary" onClick={handleScanFIFO} disabled={!selectedOrder}>
                    Scan Barang (FIFO)
                </Button>,
                <Button danger onClick={() => setScannedItems([])}>
                    Clear
                </Button>,
                <Button
                    type="primary"
                    onClick={handleConfirmQC}
                    disabled={scannedItems.length === 0}
                >
                    Confirm QC
                </Button>,
            ]}
        >
            <Meta
                style={{
                    borderRadius: 4,
                    margin: '-12px -12px 0 -12px',
                    padding: 10,
                }}
                title="Outbound QC"
                description={
                    selectedOrder
                        ? `Scan & validasi barang untuk ${selectedOrder.orderNumber} (${selectedOrder.store})`
                        : 'Pilih order di panel kiri untuk memulai QC'
                }
            />

            <List
                size="small"
                pagination={{
                    size: 'small',
                    align: 'center',
                    showSizeChanger: false,
                    pageSize: 7,
                    current: currentPage,
                    onChange: (page) => setCurrentPage(page),
                }}
                dataSource={scannedItems}
                locale={{ emptyText: <Empty description="Belum ada barang discan" /> }}
                renderItem={(item: any, i: number) => {
                    const globalIndex = (currentPage - 1) * 7 + i + 1;
                    return (
                        <List.Item>
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text>{globalIndex}.</Text>
                                        <Text>{item.name}</Text>
                                        <Tag color="red">Expired: {item.expired}</Tag>
                                    </Space>
                                }
                                description={<Text type="secondary">RFID: {item.rfid}</Text>}
                            />
                        </List.Item>
                    );
                }}
            />
        </Card>
    );
}
