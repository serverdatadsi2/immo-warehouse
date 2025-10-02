import axiosIns from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, List, Modal, Typography, message } from 'antd';
import { useCallback, useState } from 'react';
import { useRemoveRfid } from '../context';

const { Text } = Typography;
const { Meta } = Card;

export function RightPannel() {
    const { scannedRfids, setScannedRfids, isScanning } = useRemoveRfid();
    const [loading, setLoading] = useState<boolean>(false);

    const { mutate } = useMutation({
        mutationFn: (rfid_tags: string[]) =>
            axiosIns.post('/remove-rfid/remove', {
                rfid_tags,
            }),

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
            title: 'Konfirmasi Penghapusan RFID',
            content: (
                <div>
                    <p>Apakah Anda yakin ingin menghapus RFID berikut?</p>
                    <p className="text-red-600 font-semibold">
                        Pastikan RFID sudah benar-benar dihancurkan (dilipat, disobek, dll) sebelum
                        melanjutkan.
                    </p>
                    <div className="mt-2">
                        <p>
                            Jumlah RFID yang akan dihapus:{' '}
                            <strong>{scannedRfids?.length || 0}</strong>
                        </p>
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
            size="small"
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
                title="RFID untuk Dihapus"
                description={
                    scannedRfids && scannedRfids.length > 0
                        ? `${scannedRfids.length} RFID siap untuk dihapus`
                        : 'Belum ada RFID yang di-scan'
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
                locale={{ emptyText: 'Belum ada RFID yang di-scan' }}
                renderItem={(item, i) => (
                    <List.Item
                        actions={[
                            <Button
                                size="small"
                                danger
                                onClick={() => removeRfidFromList(item.rfid)}
                            >
                                Cancle
                            </Button>,
                        ]}
                    >
                        <List.Item.Meta
                            title={
                                <div className="flex gap-x-2">
                                    <Text>{i + 1}.</Text>
                                    <Text>RFID: {item.rfid}</Text>
                                </div>
                            }
                            description={
                                item.product_name && item.product_code
                                    ? `${item.product_code} - ${item.product_name}`
                                    : 'Produk tidak ditemukan'
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}
