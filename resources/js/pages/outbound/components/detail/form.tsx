import { FormItem } from '@/components/forms/form-item';
import QRCodeScanner from '@/components/scanner/qr-scanner';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { ScanOutlined, SendOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Typography, notification } from 'antd';
import { useCallback, useContext, useState } from 'react';
import { DetailContext } from '../../detail';

const { Text } = Typography;

export function DetailForm() {
    const { params, headerData } = useContext(DetailContext);

    const { form, post, processing, errors } = useAntdInertiaForm<{
        rfid: string;
        warehouse_outbound_id: string;
    }>('Outbound Detail');
    const [isScanningLocation, setIsScanningLocation] = useState<boolean>(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const handleSwitchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    const handleScanItem = useCallback(
        (value: string) => {
            setIsScanningLocation(false);
            form.setFieldsValue({ rfid: value });
            notification.success({ message: 'RFID berhasil discan!', duration: 1 });
        },
        [form],
    );

    const handleSubmit = useCallback(async () => {
        const formValues = await form.validateFields();
        post({
            url: '/outbound/detail',
            data: { ...formValues, warehouse_outbound_id: params?.headerId ?? headerData?.id },
            onSuccess: () => {
                form.resetFields();
            },
        });
    }, [form, post, params?.headerId, headerData?.id]);

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
                                    RFID Tag
                                </Text>
                            }
                            name="rfid"
                            rules={[{ required: true, message: 'Harap masukkan RFID Tag!' }]}
                            errorMessage={errors?.rfid}
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
