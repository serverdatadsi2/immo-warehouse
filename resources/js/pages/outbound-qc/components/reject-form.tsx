import { ConditionAutoComplete } from '@/components/auto-complate/condition';
import QRCodeScanner from '@/components/scanner/qr-scanner';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { QrcodeOutlined, ScanOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Row } from 'antd';
import React, { useCallback, useState } from 'react';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const RejectedModalForm: React.FC<Props> = React.memo(({ visible, onClose }) => {
    const { form, post, processing } = useAntdInertiaForm('Reject Outbound QC');
    // const queryClient = useQueryClient();

    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [scan, setScan] = useState<boolean>(false);

    const handleSwitchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    const handleScan = useCallback(
        (value: string) => {
            setScan(false);
            form.setFieldsValue({ rfid: value });
        },
        [form],
    );

    const handleOk = useCallback(async () => {
        const formValues = await form.validateFields();
        post({
            url: '/outbound-qc/rejected',
            data: formValues,
            onSuccess: () => {
                onClose();
                form.resetFields();
                // queryClient.invalidateQueries({ queryKey: ['monitoring-outbound-qc'] }); //refetch
            },
        });
    }, [form, post, onClose]);

    return (
        <Modal
            title={
                <>
                    <QrcodeOutlined /> Input Reject Outbound Qc
                </>
            }
            open={visible}
            onOk={handleOk}
            okButtonProps={{ disabled: processing, loading: processing }}
            cancelButtonProps={{ disabled: processing, loading: processing }}
            onCancel={() => {
                setScan(false); // Pastikan scanner mati saat modal ditutup
                onClose();
            }}
            confirmLoading={processing}
            keyboard={false}
            maskClosable={false}
            centered
        >
            <Form form={form} layout="vertical">
                {scan ? (
                    <div className="space-y-2 text-center mb-5">
                        <Button danger icon={<StopOutlined />} onClick={() => setScan((s) => !s)}>
                            Stop Scan
                        </Button>
                        <QRCodeScanner
                            onSwitchCamera={handleSwitchCamera}
                            facingMode={facingMode}
                            onScan={handleScan}
                            isActive={scan}
                        />
                    </div>
                ) : (
                    <Row gutter={5} align="middle">
                        <Col span={17}>
                            <Form.Item
                                name="rfid"
                                label="QR Code / RFID Tag ID"
                                rules={[{ required: true, message: 'Harap masukkan RFID Tag!' }]}
                            >
                                <Input
                                    // disabled
                                    placeholder="Klik Tombol disamping untuk scan..."
                                    onPressEnter={handleOk}
                                    autoComplete="off"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={7} flex="auto">
                            <Button
                                icon={<ScanOutlined />}
                                type="primary"
                                onClick={() => setScan((s) => !s)}
                                className="!bg-emerald-600 mt-1.5"
                            >
                                Mulai Scan
                            </Button>
                        </Col>
                    </Row>
                )}

                <Form.Item
                    name="condition"
                    label="Kerusakan barang (Kosongkan jika barang dalam kondisi bagus)"
                >
                    <ConditionAutoComplete placeholder="Kosongkan jika kondisi barang bagus" />
                </Form.Item>

                <Form.Item name="note" label="Reject Note">
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
});

export default RejectedModalForm;
