import QRCodeScanner from '@/components/scanner/qr-scanner';
import { AppLayout } from '@/layouts/app-layout';
import axiosIns from '@/lib/axios';
import { ProductStock } from '@/types/location-stock.type';
import { ReloadOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Button, message, Space } from 'antd';
import { useCallback, useState } from 'react';
import BarangDetailOverviewCard from './components/product-detail';

export default function SearchProductPage() {
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [data, setData] = useState<ProductStock>();

    const handleScan = useCallback((barcodeValue: string) => {
        axiosIns
            .get(`/search-product/warehouse/${barcodeValue}`)
            .then((res) => {
                if (res.data) {
                    setData(res.data);
                    message.info('Lokasi Barang di temukan');
                } else {
                    message.error('Lokasi Barang tidak ditemukan');
                }
            })
            .catch(() => {
                message.error('Gagal memverifikasi RFID');
            });
    }, []);

    const handleSwitchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);
    return (
        <AppLayout navBarTitle="Search Product">
            <Head title="Search Product" />
            {!data && (
                <QRCodeScanner
                    facingMode={facingMode}
                    onScan={handleScan}
                    onSwitchCamera={handleSwitchCamera}
                    isActive={!data}
                />
            )}
            <Button onClick={() => handleScan('470998a6-6e93-43d3-9a33-ce0169247af1')}>
                Scan Now
            </Button>
            {data && (
                <Space direction="vertical" size={20} className="w-full text-center">
                    <Space
                        direction="vertical"
                        size={20}
                        //  className="w-full text-center px-25"
                        className="justify-center max-w-4xl mx-auto text-center px-4 lg:px-20"
                    >
                        <BarangDetailOverviewCard data={data} />
                        <Button
                            icon={<ReloadOutlined />}
                            type="primary"
                            className="w-full !bg-emerald-400 !p-5 !font-semibold"
                            onClick={() => setData(undefined)}
                        >
                            Scan Ulang
                        </Button>
                    </Space>
                </Space>
            )}
        </AppLayout>
    );
}
