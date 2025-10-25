import axiosIns from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, List, message, Modal, Space, Tag, Typography } from 'antd';
import { useCallback, useState } from 'react';
import { useRemoveRfid } from '../context';

const { Text, Title } = Typography;
const { Meta } = Card;

export function RightPannel() {
    const { scannedRfids, setScannedRfids, isScanning } = useRemoveRfid();
    const [loading, setLoading] = useState<boolean>(false);

    const { mutate } = useMutation({
        mutationFn: (rfid_tags: string[]) => axiosIns.post('/rfid/remove/remove', { rfid_tags }),
        onSuccess: () => {
            message.success('RFID berhasil dihapus');
            setScannedRfids([]);
        },
        onError: (error) => {
            message.error('Gagal menghapus RFID');
            // eslint-disable-next-line no-console
            console.error('error removing rfid', error);
        },
    });

    const handleRemoveRfid = useCallback(() => {
        setLoading(true);
        mutate(scannedRfids?.map((data) => data.rfid));
    }, [mutate, scannedRfids]);

    const handleConfirmRemove = () => {
        Modal.confirm({
            title: (
                <Title level={5} style={{ color: '#ff4d4f', marginBottom: 0 }}>
                    Konfirmasi Penghapusan RFID
                </Title>
            ),
            content: (
                <div>
                    <Text>Apakah Anda yakin ingin menghapus RFID berikut?</Text>
                    <Text type="danger" strong className="block mt-2">
                        Pastikan RFID sudah benar-benar dihancurkan (dilipat, disobek, dll) sebelum
                        melanjutkan.
                    </Text>
                    <div className="mt-2">
                        <Text>
                            Jumlah RFID yang akan dihapus:{' '}
                            <Tag color="red">{scannedRfids?.length || 0}</Tag>
                        </Text>
                    </div>
                </div>
            ),
            okText: 'Ya, Hapus RFID',
            cancelText: 'Batal',
            okType: 'danger',
            onOk: handleRemoveRfid,
        });
    };

    const removeRfidFromList = (rfidId: string) => {
        setScannedRfids((prev) => prev?.filter((data) => data.rfid !== rfidId) || []);
    };

    return (
        <Card
            style={{
                background: '#fff1f0',
                borderRadius: 12,
                boxShadow: '0 2px 8px #ff4d4f22',
            }}
            actions={[
                <Button
                    danger
                    disabled={isScanning || !scannedRfids || scannedRfids.length === 0}
                    onClick={() => setScannedRfids([])}
                >
                    Clear All
                </Button>,
                <Button
                    type="primary"
                    danger
                    disabled={isScanning || !scannedRfids || scannedRfids.length === 0 || loading}
                    onClick={handleConfirmRemove}
                >
                    Hapus RFID ({scannedRfids?.length || 0})
                </Button>,
            ]}
        >
            <Meta
                style={{
                    backgroundColor: scannedRfids && scannedRfids.length > 0 ? '#ffebee' : '',
                    borderRadius: 4,
                    margin: '-12px -12px 0 -12px',
                    padding: 10,
                }}
                title={
                    <Title level={5} style={{ color: '#ff4d4f', marginBottom: 0 }}>
                        RFID untuk Dihapus
                    </Title>
                }
                description={
                    scannedRfids && scannedRfids.length > 0 ? (
                        <Text strong>{scannedRfids.length} RFID siap untuk dihapus</Text>
                    ) : (
                        <Text type="secondary">Belum ada RFID yang di-scan</Text>
                    )
                }
            />
            <List
                size="small"
                pagination={{
                    size: 'small',
                    showSizeChanger: false,
                    align: 'center',
                    pageSize: 10,
                }}
                dataSource={scannedRfids}
                locale={{ emptyText: <Text type="secondary">Belum ada RFID yang di-scan</Text> }}
                renderItem={(item, i) => (
                    <List.Item
                        style={{
                            background: i % 2 === 0 ? '#fff2e8' : '#fff',
                            borderRadius: 8,
                            marginBottom: 4,
                        }}
                        actions={[
                            <Button
                                size="small"
                                danger
                                onClick={() => removeRfidFromList(item.rfid)}
                            >
                                Cancel
                            </Button>,
                        ]}
                    >
                        <List.Item.Meta
                            title={
                                <Space>
                                    <Text strong>{i + 1}.</Text>
                                    <Tag color="red">{item.rfid}</Tag>
                                </Space>
                            }
                            description={
                                item.product_name && item.product_code ? (
                                    <Text>
                                        {item.product_code} - {item.product_name}
                                    </Text>
                                ) : (
                                    <Text type="secondary">Produk tidak ditemukan</Text>
                                )
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}
