import { ConditionAutoComplete } from '@/components/auto-complate/condition';
import QRCodeScanner from '@/components/scanner/qr-scanner';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { QrcodeOutlined, ScanOutlined, StopOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Col, Form, Input, Modal, Row } from 'antd';
import React, { useCallback, useContext, useState } from 'react';
import { DetailContext } from '../../monitoring';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const BadLabelingModal: React.FC<Props> = React.memo(({ visible, onClose }) => {
    const { form, post, processing } = useAntdInertiaForm<{ rfid: string; condition: string }>(
        'Bad Labelling',
    );
    const { header } = useContext(DetailContext);

    const queryClient = useQueryClient();

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
            url: '/stock-opname/bad-condition-item',
            data: { stock_opname_id: header?.id, ...formValues },
            onSuccess: () => {
                onClose();
                form.resetFields();
                queryClient.invalidateQueries({ queryKey: ['all-conditions'] }); //refetch
            },
        });
    }, [form, post, onClose, queryClient, header]);

    return (
        <Modal
            title={
                <>
                    <QrcodeOutlined /> Input Bad Labeling Item
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
                                rules={[{ required: true, message: 'Harap masukkan Tag ID!' }]}
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
                    label="Kondisi Kerusakan / Notes"
                    rules={[{ required: true, message: 'Harap masukkan kondisi kerusakan!' }]}
                >
                    <ConditionAutoComplete />
                </Form.Item>
            </Form>
        </Modal>
    );
});

export default BadLabelingModal;
