import { FormItem } from '@/components/forms/form-item';
import QRCodeScanner from '@/components/scanner/qr-scanner';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { ScanOutlined, SendOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Typography, notification } from 'antd';
import { useCallback, useState } from 'react';

const { Text } = Typography;

export function HeaderForm() {
    const { form, post, processing, errors } = useAntdInertiaForm<{
        location_rfid_tag_id: string;
    }>('Staging Area');
    const [isScanningLocation, setIsScanningLocation] = useState<boolean>(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const handleSwitchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    const handleScanLocation = useCallback(
        (value: string) => {
            setIsScanningLocation(false);
            form.setFieldsValue({ location_rfid_tag_id: value });
            notification.success({ message: 'Staging Area berhasil discan!', duration: 1 });
        },
        [form],
    );

    const handleSubmit = useCallback(async () => {
        const formValues = await form.validateFields();
        post({
            url: '/staging/manual-input',
            data: formValues,
            onSuccess: () => {
                form.resetFields();
            },
        });
    }, [form, post]);

    return (
        <Card
            size="small"
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
                paddingLeft: 20,
            }}
        >
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
                                        RFID Staging Tag
                                    </Text>
                                }
                                name="location_rfid_tag_id"
                                rules={[
                                    { required: true, message: 'Harap masukkan RFID Staging Tag!' },
                                ]}
                                errorMessage={errors?.location_rfid_tag_id}
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
        </Card>
    );
}
