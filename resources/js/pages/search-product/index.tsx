import QRCodeScanner from '@/components/scanner/qr-scanner';
import { ProductAsyncSelect } from '@/components/selects/product';
import { AppLayout } from '@/layouts/app-layout';
import axiosIns from '@/lib/axios';
import { ProductStock } from '@/types/location-stock.type';
import { QrcodeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Button, Card, Form, message, Space, Tabs, Typography } from 'antd';
import { useCallback, useState } from 'react';
import BarangDetailOverviewCard from './components/product-detail';

const { Text } = Typography;
export default function SearchProductPage() {
    const [form] = Form.useForm();
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [data, setData] = useState<ProductStock>();
    const [activeTab, setActiveTab] = useState<string>('manual');

    const handleScan = useCallback((QRCode: string) => {
        axiosIns
            .get(`/search-product/warehouse?rfid=${QRCode}`)
            .then((res) => {
                if (res.data) {
                    setData(res.data);
                    message.info('Lokasi Barang ditemukan');
                } else {
                    message.error('Lokasi Barang tidak ditemukan');
                }
            })
            .catch(() => {
                message.error('Gagal memverifikasi RFID');
            });
    }, []);

    const handleManualSearch = useCallback(() => {
        const productId = form.getFieldValue('product_id');
        if (!productId) {
            message.warning('Silakan pilih produk terlebih dahulu');
            return;
        }

        axiosIns
            .get(`/search-product/warehouse?productId=${productId}`)
            .then((res) => {
                if (res.data) {
                    setData(res.data);
                    message.info('Lokasi Barang ditemukan');
                } else {
                    message.error('Lokasi Barang tidak ditemukan');
                }
            })
            .catch(() => {
                message.error('Gagal mencari produk');
            });
        // .finally(() => {
        // });
    }, [form]);

    const handleSwitchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    const handleReset = useCallback(() => {
        form.resetFields();
        setData(undefined);
    }, [form]);

    const tabItems = [
        {
            key: 'manual',
            label: (
                <Space>
                    <SearchOutlined />
                    Manual Search
                </Space>
            ),
            children: (
                <div className="flex justify-center my-20">
                    <Card className="min-w-xl max-w-4xl shadow-xl">
                        <div className="flex flex-col items-center">
                            <Space direction="vertical" size={16} className="w-full">
                                <Form layout="vertical" form={form}>
                                    <Form.Item
                                        label={
                                            <Text
                                                strong
                                                style={{
                                                    color: '#1890ff',
                                                    marginTop: 16,
                                                    display: 'block',
                                                }}
                                            >
                                                Nama Product
                                            </Text>
                                        }
                                        name="product_id"
                                    >
                                        <ProductAsyncSelect allowClear />
                                    </Form.Item>
                                    <Button
                                        size="large"
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        onClick={handleManualSearch}
                                        className="w-full !bg-emerald-400 !p-5 !font-semibold"
                                    >
                                        Cari Produk
                                    </Button>
                                </Form>
                            </Space>
                        </div>
                    </Card>
                </div>
            ),
        },
        {
            key: 'qr',
            label: (
                <Space>
                    <QrcodeOutlined />
                    QR Code Scan
                </Space>
            ),
            children: (
                <div className="my-20">
                    <QRCodeScanner
                        facingMode={facingMode}
                        onScan={handleScan}
                        onSwitchCamera={handleSwitchCamera}
                        isActive={!data && activeTab === 'qr'}
                    />
                </div>
            ),
        },
    ];

    return (
        <AppLayout navBarTitle="Search Product">
            <Head title="Search Product" />

            {!data ? (
                <Tabs centered activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            ) : (
                <Space direction="vertical" size={20} className="w-full text-center">
                    {/* <Space
                        direction="vertical"
                        size={20}
                        className="justify-center max-w-4xl mx-auto text-center px-4 lg:px-20"
                    > */}
                    <BarangDetailOverviewCard data={data} />
                    <Button
                        icon={<ReloadOutlined />}
                        type="primary"
                        className="w-full !bg-emerald-400 !p-5 !font-semibold"
                        onClick={handleReset}
                    >
                        {activeTab === 'qr' ? 'Scan Ulang' : 'Cari Lagi'}
                    </Button>
                    {/* </Space> */}
                </Space>
            )}
        </AppLayout>
    );
}
