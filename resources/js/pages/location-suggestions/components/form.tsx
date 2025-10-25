import { DeleteButton, SaveButton } from '@/components/buttons/common-buttons';
import { FormItem } from '@/components/forms/form-item';
import { LocationSelect } from '@/components/selects/location';
import { ProductAsyncSelect } from '@/components/selects/product';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { usePermission } from '@/hooks/use-permission';
import { LocationSuggestion } from '@/types/location-suggestion.type';
import { CloseOutlined } from '@ant-design/icons';
import { Col, Form, Modal, Row, Space, Tooltip } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';

interface LocationSuggestionFormProps {
    open: boolean;
    onClose: () => void;
    existingData?: LocationSuggestion;
}

export function LocationSuggestionForm({
    open,
    onClose,
    existingData,
}: LocationSuggestionFormProps) {
    const { hasPermission, hasAnyPermission } = usePermission();
    const { form, errors, processing, post, destroy } =
        useAntdInertiaForm<LocationSuggestionFormData>('Location Suggestion');

    const modalTitle = useMemo(
        () => `${existingData ? 'Edit' : 'Tambah'} Location Suggestion`,
        [existingData],
    );

    const _onClose = useCallback(() => {
        form.resetFields();
        onClose();
    }, [form, onClose]);

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue();

        if (!formValues.location_id) {
            form.setFields([{ name: 'location_id', errors: ['Layer harus dipilih'] }]);
            return;
        }

        const data = {
            ...existingData,
            ...formValues,
        };

        post({
            url: '/master/location-suggestions',
            data,
            onSuccess: () => {
                _onClose();
            },
        });
    }, [_onClose, existingData, form, post]);

    const handleDelete = useCallback(() => {
        if (existingData) {
            destroy({
                url: `/master/location-suggestions/${existingData.id}`,
                onSuccess: () => {
                    _onClose();
                },
            });
        }
    }, [destroy, existingData, _onClose]);

    useEffect(() => {
        if (existingData) {
            form.setFieldsValue({
                product_id: existingData.product_id,
                room_id: existingData.room_id,
                rack_id: existingData.rack_id,
                location_id: existingData.location_id,
            });
        }
    }, [existingData, form]);

    return (
        <Modal
            title={modalTitle}
            footer={
                <Space>
                    {hasPermission('location_suggestion.delete') && (
                        <DeleteButton
                            onClick={handleDelete}
                            disabled={!existingData || processing}
                        />
                    )}
                    {hasAnyPermission(['location_suggestion.create', 'location_suggestion.update'])}
                    <SaveButton onClick={handleSave} disabled={processing} />
                </Space>
            }
            open={open}
            onCancel={_onClose}
            closeIcon={
                <Tooltip title="(esc)">
                    <CloseOutlined />
                </Tooltip>
            }
            width={600}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={24}>
                        <FormItem
                            errorMessage={errors?.product_id}
                            name="product_id"
                            label="Product"
                            required
                        >
                            <ProductAsyncSelect />
                        </FormItem>
                    </Col>

                    <Col span={24}>
                        <FormItem
                            errorMessage={errors?.room_id}
                            name="room_id"
                            label="Room"
                            required
                        >
                            <LocationSelect
                                type="room"
                                placeholder="Pilih Room"
                                onChange={(value) => {
                                    form.setFieldsValue({
                                        room_id: value,
                                        rack_id: undefined,
                                        location_id: undefined,
                                    });
                                }}
                            />
                        </FormItem>
                    </Col>

                    <Col span={24}>
                        <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => {
                                const roomId = getFieldValue('room_id');
                                return (
                                    <FormItem
                                        errorMessage={errors?.rack_id}
                                        name="rack_id"
                                        label="Rack"
                                        required
                                    >
                                        <LocationSelect
                                            type="rack"
                                            parentId={roomId}
                                            placeholder="Pilih Rack"
                                            onChange={(value) => {
                                                form.setFieldsValue({
                                                    rack_id: value,
                                                    location_id: undefined,
                                                });
                                            }}
                                        />
                                    </FormItem>
                                );
                            }}
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => {
                                const rackId = getFieldValue('rack_id');
                                return (
                                    <FormItem
                                        errorMessage={errors?.location_id}
                                        name="location_id"
                                        label="Layer"
                                        required
                                    >
                                        <LocationSelect
                                            type="layer"
                                            parentId={rackId}
                                            placeholder="Pilih Layer"
                                            onChange={(value) => {
                                                form.setFieldsValue({ location_id: value });
                                            }}
                                        />
                                    </FormItem>
                                );
                            }}
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}

interface LocationSuggestionFormData {
    product_id: string;
    room_id?: string;
    rack_id?: string;
    location_id?: string;
}
