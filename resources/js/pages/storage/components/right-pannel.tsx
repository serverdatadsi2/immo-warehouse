import { FormItem } from '@/components/forms/form-item';
import QRCodeScanner from '@/components/scanner/qr-scanner';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { SaveOutlined, ScanOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Typography, notification } from 'antd';
import React, { useCallback, useState } from 'react';

const { Title, Text } = Typography;

const RightPannel: React.FC = () => {
    const { form, post, processing, errors } = useAntdInertiaForm<{
        rfid: string;
        location: string;
    }>('Lokasi Penyimpanan Barang');
    const [isScanningRfid, setIsScanningRfid] = useState<boolean>(false);
    const [isScanningLocation, setIsScanningLocation] = useState<boolean>(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const handleSwitchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    const handleScanRfid = useCallback(
        (value: string) => {
            setIsScanningRfid(false);
            form.setFieldsValue({ rfid: value });
            notification.success({ message: 'RFID berhasil discan!', duration: 1 });
        },
        [form],
    );

    const handleScanLocation = useCallback(
        (value: string) => {
            setIsScanningLocation(false);
            form.setFieldsValue({ location: value });
            notification.success({ message: 'Lokasi berhasil discan!', duration: 1 });
        },
        [form],
    );

    const handleSubmit = useCallback(async () => {
        const formValues = await form.validateFields();
        post({
            url: '/storage-warehouse/assignment',
            data: formValues,
            onSuccess: () => {
                form.resetFields();
            },
        });
    }, [form, post]);

    const handleCancle = useCallback(() => {
        form.resetFields();
    }, [form]);

    return (
        <Card
            style={{
                background: '#f5faff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #1890ff11',
            }}
            actions={[
                <Button key="cancel" onClick={handleCancle} disabled={processing}>
                    Batal
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                    loading={processing}
                    disabled={isScanningRfid || isScanningLocation}
                    className="!bg-blue-600"
                >
                    Simpan (Lokasi Penyimpanan)
                </Button>,
            ]}
        >
            <Title level={5} style={{ color: '#1890ff', marginBottom: 0 }}>
                Scan Barang dan Lokasi
            </Title>
            <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                Scan barang dan lokasi untuk melakukan assignment manual.
            </Text>

            <Form form={form} layout="vertical" className="mt-4">
                {isScanningRfid ? (
                    <div className="space-y-2 text-center mb-5 border p-2 rounded">
                        <Button
                            danger
                            icon={<StopOutlined />}
                            onClick={() => setIsScanningRfid(false)}
                        >
                            Stop Scan Barang
                        </Button>
                        <QRCodeScanner
                            onSwitchCamera={handleSwitchCamera}
                            facingMode={facingMode}
                            onScan={handleScanRfid}
                            isActive={isScanningRfid}
                        />
                    </div>
                ) : (
                    <Row gutter={5} align="middle">
                        <Col span={17}>
                            <FormItem
                                label={
                                    <Text strong style={{ color: '#1890ff' }}>
                                        QR Code / RFID Tag Barang
                                    </Text>
                                }
                                name="rfid"
                                rules={[{ required: true, message: 'Harap masukkan Tag ID!' }]}
                                errorMessage={errors?.rfid}
                            >
                                <Input
                                    placeholder="Klik Tombol disamping untuk scan..."
                                    onPressEnter={handleSubmit}
                                    autoComplete="off"
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <Button
                                icon={<ScanOutlined />}
                                type="primary"
                                onClick={() => setIsScanningRfid(true)}
                                className="!bg-emerald-600 mt-1.5"
                                disabled={isScanningLocation}
                            >
                                Scan Barang
                            </Button>
                        </Col>
                    </Row>
                )}

                {isScanningLocation ? (
                    <div className="space-y-2 text-center mb-5 border p-2 rounded">
                        <Button
                            danger
                            icon={<StopOutlined />}
                            onClick={() => setIsScanningLocation(false)}
                        >
                            Stop Scan Lokasi
                        </Button>
                        <QRCodeScanner
                            onSwitchCamera={handleSwitchCamera}
                            facingMode={facingMode}
                            onScan={handleScanLocation}
                            isActive={isScanningLocation}
                        />
                    </div>
                ) : (
                    <Row gutter={5} align="middle">
                        <Col span={17}>
                            <FormItem
                                label={
                                    <Text
                                        strong
                                        style={{
                                            color: '#1890ff',
                                            marginTop: 16,
                                            display: 'block',
                                        }}
                                    >
                                        RFID Tag Lokasi
                                    </Text>
                                }
                                name="location"
                                rules={[{ required: true, message: 'Harap masukkan Tag ID!' }]}
                                errorMessage={errors?.location}
                            >
                                <Input
                                    placeholder="Klik Tombol disamping untuk scan..."
                                    onPressEnter={handleSubmit}
                                    autoComplete="off"
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <Button
                                icon={<ScanOutlined />}
                                type="primary"
                                onClick={() => setIsScanningLocation(true)}
                                className="!bg-emerald-600 mt-5"
                                disabled={isScanningRfid}
                            >
                                Scan Lokasi
                            </Button>
                        </Col>
                    </Row>
                )}
            </Form>
        </Card>
    );
};

export default RightPannel;
