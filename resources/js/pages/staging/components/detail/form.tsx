import { FormItem } from '@/components/forms/form-item';
import QRCodeScanner from '@/components/scanner/qr-scanner';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { ScanOutlined, SendOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Typography, notification } from 'antd';
import { useCallback, useState } from 'react';

const { Text } = Typography;

interface Props {
    header: string;
}

export function DetailForm({ header }: Props) {
    const { form, post, processing, errors } = useAntdInertiaForm<{
        warehouse_outbound_id: string;
        warehouse_staging_outbound_id: string;
    }>('Detail Staging Area');
    const [isScanningLocation, setIsScanningLocation] = useState<boolean>(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const handleSwitchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    const handleScanItem = useCallback(
        (value: string) => {
            setIsScanningLocation(false);
            form.setFieldsValue({ warehouse_outbound_id: value });
            notification.success({ message: 'RFID berhasil discan!', duration: 1 });
        },
        [form],
    );

    const handleSubmit = useCallback(async () => {
        const formValues = await form.validateFields();
        post({
            url: '/staging/manual-input/detail',
            data: { ...formValues, warehouse_staging_outbound_id: header },
            onSuccess: () => {
                form.resetFields();
            },
        });
    }, [form, post, header]);

    return (
        <Form form={form} layout="vertical" className="mt-4">
            {isScanningLocation ? (
                <div className="space-y-2 text-center mb-5 border p-2 rounded">
                    <Button
                        danger
                        icon={<StopOutlined />}
                        onClick={() => setIsScanningLocation(false)}
                    >
                        Stop Scan
                    </Button>
                    <QRCodeScanner
                        onSwitchCamera={handleSwitchCamera}
                        facingMode={facingMode}
                        onScan={handleScanItem}
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
                                    QRCode Outbound
                                </Text>
                            }
                            name="warehouse_outbound_id"
                            rules={[{ required: true, message: 'Harap masukkan RFID Tag!' }]}
                            errorMessage={errors?.warehouse_outbound_id}
                        >
                            <Input
                                placeholder="Klik Tombol disamping untuk scan..."
                                onPressEnter={handleSubmit}
                                autoComplete="off"
                                allowClear
                            />
                        </FormItem>
                    </Col>
                    <Col span={5}>
                        <Button
                            icon={<ScanOutlined />}
                            type="primary"
                            onClick={() => setIsScanningLocation(true)}
                            className="!bg-emerald-600 mt-5"
                        >
                            Scan
                        </Button>
                    </Col>
                    <Col span={2}>
                        <Button
                            iconPosition="end"
                            key="save"
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSubmit}
                            loading={processing}
                            disabled={isScanningLocation}
                            className=" mt-5"
                        >
                            Save
                        </Button>
                    </Col>
                </Row>
            )}
        </Form>
    );
}
