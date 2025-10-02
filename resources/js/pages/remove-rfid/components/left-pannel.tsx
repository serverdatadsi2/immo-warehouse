import axiosIns from '@/lib/axios';
import { Button, Card, Space, Typography, message } from 'antd';
import { useCallback, useState } from 'react';
import { useRemoveRfid } from '../context';
import QRCodeScanner from './qr-scanner';

const { Text } = Typography;

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
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <Text strong>Scanner RFID</Text>
                    <Button
                        type={isScanning ? 'default' : 'primary'}
                        onClick={handleToggleScanning}
                    >
                        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                    </Button>
                </div>

                {isScanning && (
                    <QRCodeScanner
                        facingMode={facingMode}
                        onScan={handleScan}
                        onSwitchCamera={handleSwitchCamera}
                        isActive={isScanning}
                    />
                )}

                {!isScanning && (
                    <div className="text-center py-8 text-gray-500">
                        <p>Klik "Start Scanning" untuk memulai scan RFID</p>
                    </div>
                )}
            </Card>

            <Card>
                <div className="space-y-2">
                    <Text strong>Instruksi:</Text>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        <li>Klik "Start Scanning" untuk mengaktifkan kamera</li>
                        <li>Arahkan kamera ke QR code RFID yang akan dihapus</li>
                        <li>RFID akan otomatis ter-scan dan ditambahkan ke list</li>
                        <li>
                            Pastikan RFID sudah dihancurkan secara fisik sebelum menghapus dari
                            sistem
                        </li>
                        <li>Klik "Hapus RFID" untuk menghapus RFID dari system</li>
                    </ol>
                </div>
            </Card>
        </Space>
    );
}
