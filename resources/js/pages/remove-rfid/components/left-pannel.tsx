import QRCodeScanner from '@/components/scanner/qr-scanner';
import axiosIns from '@/lib/axios';
import { CameraOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Card, Space, Typography, message } from 'antd';
import { useCallback, useState } from 'react';
import { useRemoveRfid } from '../context';

const { Text, Title } = Typography;

export function LeftPannel() {
    const { isScanning, setIsScanning, addScannedRfid } = useRemoveRfid();
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const handleScan = useCallback(
        (barcodeValue: string) => {
            axiosIns
                .get(`/remove-rfid/check-rfid/${barcodeValue}`)
                .then((res) => {
                    if (res.data && res.data.exists) {
                        addScannedRfid(res.data);
                        message.success('RFID berhasil di-scan dan ditambahkan ke list');
                    } else {
                        message.error('RFID tidak ditemukan di database');
                    }
                })
                .catch(() => {
                    message.error('Gagal memverifikasi RFID');
                });
        },
        [addScannedRfid],
    );

    const handleSwitchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    const handleToggleScanning = useCallback(() => {
        setIsScanning((prev) => !prev);
    }, [setIsScanning]);

    return (
        <Space direction="vertical" className="w-full">
            <Card
                style={{
                    background: '#f5faff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #1890ff11',
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <Title level={5} style={{ color: '#1890ff', marginBottom: 0 }}>
                        Scanner RFID
                    </Title>
                    <Space>
                        <Button
                            icon={isScanning ? <StopOutlined /> : <CameraOutlined />}
                            type={isScanning ? 'default' : 'primary'}
                            onClick={handleToggleScanning}
                        >
                            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                        </Button>
                        {/* <Button type="dashed" onClick={handleSwitchCamera} disabled={!isScanning}>
                            Switch Camera
                        </Button> */}
                    </Space>
                </div>

                {isScanning ? (
                    <QRCodeScanner
                        facingMode={facingMode}
                        onScan={handleScan}
                        onSwitchCamera={handleSwitchCamera}
                        isActive={isScanning}
                    />
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Text>Klik "Start Scanning" untuk memulai scan RFID</Text>
                    </div>
                )}
            </Card>

            <Card
                style={{
                    background: '#fffbe6',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #ffe58f55',
                }}
            >
                <Title level={5} style={{ color: '#faad14', marginBottom: 8 }}>
                    Instruksi Penghapusan RFID
                </Title>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Klik "Start Scanning" untuk mengaktifkan kamera</li>
                    <li>Arahkan kamera ke QR code RFID yang akan dihapus</li>
                    <li>RFID akan otomatis ter-scan dan ditambahkan ke list</li>
                    <li>
                        Pastikan RFID sudah dihancurkan secara fisik sebelum menghapus dari sistem
                    </li>
                    <li>Klik "Hapus RFID" untuk menghapus RFID dari sistem</li>
                </ol>
            </Card>
        </Space>
    );
}
