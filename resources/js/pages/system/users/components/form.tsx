import { DeleteButton, SaveButton } from '@/components/buttons/common-buttons';
import { FormItem } from '@/components/forms/form-item';
import { RoleAsyncSelect } from '@/components/selects/role';
import { WarehouseAsyncSelect } from '@/components/selects/warehouse';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { User } from '@/types/user.type';
import { CloseOutlined } from '@ant-design/icons';
import { Col, Form, Input, Modal, Row, Space, Tooltip } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';

interface Props {
    existingData?: User | undefined;
    open: boolean;
    onClose?: () => void;
}

interface UserFormData {
    name: string;
    username: string;
    email: string;
    password?: string;
    role: string;
    warehouse_id: string;
}

export function FormModal({ existingData, open, onClose }: Props) {
    const { form, errors, processing, post, destroy } = useAntdInertiaForm<UserFormData>('User');

    const modalTitle = useMemo(() => `${existingData ? 'Edit' : 'Add New'} User`, [existingData]);

    const _onClose = useCallback(() => {
        form.resetFields();
        onClose?.();
    }, [form, onClose]);

    const handleSave = useCallback(() => {
        const values = form.getFieldsValue();

        post({
            url: '/system/users',
            data: {
                ...existingData,
                ...values,
            },
            onSuccess: () => _onClose(),
        });
    }, [form, post, existingData, _onClose]);

    const handleDelete = useCallback(() => {
        if (existingData) {
            destroy({
                url: `/system/users/${existingData.id}`,
                onSuccess: () => {
                    _onClose();
                },
            });
        }
    }, [destroy, existingData, _onClose]);

    useEffect(() => {
        form.setFieldsValue({
            ...existingData,
            warehouse_id: existingData?.warehouse?.id,
        });
    }, [existingData, form]);

    return (
        <Modal
            title={modalTitle}
            open={open}
            width={700}
            onCancel={_onClose}
            footer={
                <Space>
                    <DeleteButton onClick={handleDelete} />
                    <SaveButton onClick={handleSave} disabled={processing} />
                </Space>
            }
            closeIcon={
                <Tooltip title="(esc)">
                    <CloseOutlined />
                </Tooltip>
            }
        >
            <Form form={form} layout="vertical" autoComplete="off">
                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem name="name" label="Name" errorMessage={errors?.name} required>
                            <Input placeholder="Enter name" />
                        </FormItem>
                    </Col>

                    <Col span={12}>
                        <FormItem
                            name="username"
                            label="Username"
                            errorMessage={errors?.username}
                            required
                        >
                            <Input placeholder="Enter username" autoComplete="off" />
                        </FormItem>
                    </Col>

                    <Col span={12}>
                        <FormItem name="email" label="Email" errorMessage={errors?.email} required>
                            <Input placeholder="Enter email" type="email" autoComplete="off" />
                        </FormItem>
                    </Col>

                    <Col span={12}>
                        <FormItem
                            name="password"
                            label="New Password"
                            errorMessage={errors?.password}
                        >
                            <Input.Password
                                placeholder="Leave blank to keep current"
                                autoComplete="off"
                            />
                        </FormItem>
                    </Col>

                    <Col span={12}>
                        <FormItem name="role" label="Role" errorMessage={errors?.role} required>
                            <RoleAsyncSelect />
                        </FormItem>
                    </Col>

                    <Col span={12}>
                        <FormItem
                            name="warehouse_id"
                            label="Warehouses"
                            errorMessage={errors?.warehouse_id}
                            required
                        >
                            <WarehouseAsyncSelect />
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
