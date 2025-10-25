import { SaveButton } from '@/components/buttons/common-buttons';
import { FormItem } from '@/components/forms/form-item';
import QRCodeScanner from '@/components/scanner/qr-scanner';
import { ProductAsyncSelect } from '@/components/selects/product';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { usePermission } from '@/hooks/use-permission';
import { CloseOutlined, ScanOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, notification, Row, Tooltip, Typography } from 'antd';
import { useCallback, useContext, useMemo, useState } from 'react';
import { DetailContext, DetailItem } from '../../detail';

const { Text } = Typography;
export function DetailForm({ onClose, existingData, open }: Props) {
    const { hasPermission } = usePermission();
    const { form, errors, processing, post } =
        useAntdInertiaForm<DetailFormType>('Return Inbound Detail');
    const modalTitle = useMemo(() => `${existingData ? 'Edit' : 'Add'} Detail`, [existingData]);
    const [isScanningLocation, setIsScanningLocation] = useState<boolean>(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const { header, storeReturnId } = useContext(DetailContext);

    const _onClose = useCallback(() => {
        form.resetFields();
        onClose();
    }, [form, onClose]);

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
            url: '/inbounds/return-store/detail',
            data: {
                ...formValues,
                warehouse_inbound_id: header?.id,
                store_return_id: storeReturnId,
            },
            onSuccess: () => {
                _onClose();
            },
        });
    }, [form, post, header?.id, storeReturnId, _onClose]);

    return (
        <Modal
            title={modalTitle}
            footer={
                hasPermission('inbound.return.write') && (
                    <SaveButton onClick={handleSubmit} disabled={processing} />
                )
            }
            open={open}
            onCancel={_onClose}
            closeIcon={
                <Tooltip title="(esc)">
                    <CloseOutlined />
                </Tooltip>
            }
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
                    </Row>
                )}
                <FormItem
                    label={
                        <strong
                            style={{
                                color: '#1890ff',
                                marginTop: 16,
                                display: 'block',
                            }}
                        >
                            Product ⚠️
                            <span className="text-gray-700 font-medium text-sm">
                                (Kosongkan product jika rfid tag masih bisa terbaca)
                            </span>
                        </strong>
                    }
                    name="product_id"
                    errorMessage={errors?.product_id}
                >
                    <ProductAsyncSelect />
                </FormItem>
            </Form>
        </Modal>
    );
}

type Props = {
    open: boolean;
    onClose: () => void;
    existingData: DetailItem | undefined;
};

type DetailFormType = {
    rfid: string;
    product_id: string;
};
