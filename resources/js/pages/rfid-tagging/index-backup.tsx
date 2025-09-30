import { AppLayout } from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button, Card, Col, Input, List, message, Row, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;

const MOCK_INBOUND_DETAILS = Array.from({ length: 100 }, (_, i) => {
    const categories = [
        'Serum Wajah',
        'Moisturizer',
        'Facial Wash',
        'Sunscreen',
        'Lipstick',
        'Foundation',
        'Toner',
        'Masker Wajah',
        'Body Lotion',
        'Hair Oil',
        'Shampoo',
        'Conditioner',
        'Hand Cream',
        'Eye Cream',
        'Face Mist',
    ];

    const kode = `PC${(i + 1).toString().padStart(3, '0')}`;
    const nama = categories[i % categories.length];
    const qty = Math.floor(Math.random() * 200) + 10; // antara 10 - 200
    const uom = ['pcs', 'box', 'tube', 'ml', 'gr'][i % 5];

    return {
        id: i + 1,
        kode,
        nama,
        qty,
        uom,
    };
});

const generateEpc = () => {
    return 'EPC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

export default function RFIDTaggingUI({ inboundDetails = MOCK_INBOUND_DETAILS }) {
    const [details, setDetails] = useState(inboundDetails);
    const [selectedDetailId, setSelectedDetailId] = useState(details.length ? details[0].id : null);
    const [assignments, setAssignments] = useState({});
    const [manualTagInput, setManualTagInput] = useState('');
    const [filter, setFilter] = useState('');
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        const init = {};
        details.forEach((d) => (init[d.id] = []));
        setAssignments(init);
        if (!selectedDetailId && details.length) {
            setSelectedDetailId(details[0].id);
        }
    }, [details, selectedDetailId]);

    const filteredDetails = details.filter((d) => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        return (
            d.kode.toLowerCase().includes(q) ||
            d.nama.toLowerCase().includes(q) ||
            String(d.id) === q
        );
    });

    function handleBulkAssign(detailId, tags, qtyLimit) {
        setAssignments((prev) => {
            const copy = { ...prev };
            const arr = new Set(copy[detailId] || []);
            tags.forEach((t) => arr.add(t));
            const assignedArr = Array.from(arr);
            copy[detailId] = assignedArr.slice(0, qtyLimit);
            return copy;
        });
    }

    function handleStartScan() {
        if (!selectedDetailId) return;
        setScanning(true);
        const selected = details.find((d) => d.id === selectedDetailId);
        const needed = selected.qty - (assignments[selectedDetailId]?.length || 0);
        if (needed <= 0) {
            message.info('Semua unit sudah di-tagging.');
            return;
        }
        // Simulasi scan RFID reader
        const newTags = Array.from({ length: needed }, () => generateEpc());
        handleBulkAssign(selectedDetailId, newTags, selected.qty);
        message.success(`${needed} tags berhasil di-scan dan ditugaskan.`);
        setScanning(false);
    }

    function handleManualAssign() {
        if (!manualTagInput.trim() || !selectedDetailId) return;
        const tag = manualTagInput.trim().toUpperCase();
        handleBulkAssign(
            selectedDetailId,
            [tag],
            details.find((d) => d.id === selectedDetailId).qty,
        );
        setManualTagInput('');
    }

    function handleRemoveAssignment(detailId, tag) {
        setAssignments((prev) => {
            const copy = { ...prev };
            copy[detailId] = (copy[detailId] || []).filter((t) => t !== tag);
            return copy;
        });
    }

    function handleClearAssignments() {
        if (!selectedDetailId) return;
        setAssignments((prev) => ({
            ...prev,
            [selectedDetailId]: [],
        }));
        message.info('Assignments cleared untuk item terpilih.');
    }

    function handleSaveAssignments() {
        const payload = Object.entries(assignments).map(([detailId, tags]) => ({
            detailId: Number(detailId),
            tags,
        }));
        console.log('Saving RFID assignments:', payload);
        message.success('Assignments saved (simulated). Check console for payload.');
    }

    return (
        <AppLayout navBarTitle="RFID Tagging">
            <Head title="RFID Tagging" />
            <Row gutter={16}>
                <Col span={10}>
                    <Card title="Inbound Details" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Input
                                placeholder="Cari kode atau nama..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />

                            <List
                                dataSource={filteredDetails}
                                pagination={{
                                    // onChange: (page) => {
                                    //     console.log(page);
                                    // },
                                    showSizeChanger: false,
                                    align: 'center',
                                    pageSize: 5,
                                }}
                                renderItem={(item) => {
                                    const assigned = assignments[item.id]?.length || 0;
                                    const isSelected = selectedDetailId === item.id;
                                    return (
                                        <List.Item
                                            className="p-8"
                                            onClick={() => setSelectedDetailId(item.id)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? '#e6f7ff' : '',
                                                border: isSelected ? '1px solid #1890ff' : '',
                                                borderRadius: 4,
                                                padding: 10,
                                            }}
                                        >
                                            <List.Item.Meta
                                                title={`${item.kode} — ${item.nama}`}
                                                description={`Qty: ${item.qty} ${item.uom} | Tagged: ${assigned}`}
                                            />
                                        </List.Item>
                                    );
                                }}
                            />
                            <Button
                                type="primary"
                                loading={scanning}
                                onClick={handleStartScan}
                                className="w-full"
                            >
                                {scanning ? 'Scanning...' : 'Start Scan'}
                            </Button>

                            <Card title="Manual Tag / Quick Add" size="small">
                                <Space>
                                    <Input
                                        placeholder="Masukkan EPC/tag manual"
                                        value={manualTagInput}
                                        onChange={(e) => setManualTagInput(e.target.value)}
                                    />
                                    <Button onClick={handleManualAssign}>Add</Button>
                                </Space>
                            </Card>
                        </Space>
                    </Card>
                </Col>

                <Col span={14}>
                    <Card title="Assignments" size="small">
                        {selectedDetailId ? (
                            <>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>
                                        {`${details.find((d) => d.id === selectedDetailId)?.kode} — ${details.find((d) => d.id === selectedDetailId)?.nama}`}
                                    </Text>
                                </div>
                                <List
                                    dataSource={assignments[selectedDetailId] || []}
                                    renderItem={(tag) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    size="small"
                                                    danger
                                                    onClick={() =>
                                                        handleRemoveAssignment(
                                                            selectedDetailId,
                                                            tag,
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>,
                                            ]}
                                        >
                                            <Text code>{tag}</Text>
                                        </List.Item>
                                    )}
                                    style={{ maxHeight: 400, overflowY: 'auto' }}
                                />

                                <Space
                                    style={{
                                        marginTop: 16,
                                        justifyContent: 'flex-end',
                                        width: '100%',
                                    }}
                                >
                                    <Button
                                        onClick={() =>
                                            message.info(JSON.stringify(assignments, null, 2))
                                        }
                                    >
                                        Preview Payload
                                    </Button>
                                    <Button danger onClick={handleClearAssignments}>
                                        Clear All
                                    </Button>
                                    <Button type="primary" onClick={handleSaveAssignments}>
                                        Save Assignments
                                    </Button>
                                </Space>
                            </>
                        ) : (
                            <Text type="secondary">Pilih item terlebih dahulu.</Text>
                        )}
                    </Card>
                </Col>
            </Row>
        </AppLayout>
    );
}
