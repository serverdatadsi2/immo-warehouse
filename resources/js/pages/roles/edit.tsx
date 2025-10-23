import { DeleteButton, SaveButton } from '@/components/buttons/common-buttons';
import { BackButton } from '@/components/buttons/crud-buttons';
import { FormItem } from '@/components/forms/form-item';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { AppLayout } from '@/layouts/app-layout';
import { Permission, Role } from '@/types';
import { Head } from '@inertiajs/react';
import { Button, Card, Checkbox, Form, Input, Space } from 'antd';
import { useCallback } from 'react';

interface EditRoleProps {
    role: Role;
    permissions: Permission[];
}

interface FormValues {
    name: string;
    permissions: string[];
}

export default function RoleForm({ role, permissions }: EditRoleProps) {
    const { form, errors, processing, post, destroy } = useAntdInertiaForm('Roles');

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue();
        post({
            url: route('roles.update', role.id),
            data: formValues,
            // onSuccess: _onClose,
        });
    }, [form, post, role.id]);

    const handleDelete = useCallback(() => {
        destroy({ url: `/inbounds/supplier/detail/${role?.id}` });
    }, [destroy, role?.id]);

    // Set initial values for the form
    const initialValues: FormValues = {
        name: role.name,
        permissions: role.permissions.map((d) => d.name),
    };

    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/roles" />}
            navBarTitle="Edit a role with specific permissions"
        >
            <Head title={`Edit Role - ${role.name}`} />
            <Card>
                <Form
                    form={form}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={initialValues}
                >
                    <FormItem
                        label="Role Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the role name!' }]}
                        errorMessage={errors?.name}
                    >
                        <Input />
                    </FormItem>
                    <Card>
                        <Card.Meta title="Permission" />
                        <Form.Item name="permissions">
                            <Checkbox.Group
                                options={permissions.map((permission) => ({
                                    label: permission.name,
                                    value: permission.name,
                                }))}
                            />
                        </Form.Item>
                    </Card>

                    <Space>
                        <DeleteButton onClick={handleDelete} disabled={!role || processing} />
                        <SaveButton onClick={handleSave} disabled={processing} />
                        <Button type="primary" onClick={handleSave}>
                            Update
                        </Button>
                        <Button htmlType="button" onClick={() => form.resetFields()}>
                            Reset
                        </Button>
                    </Space>
                </Form>
            </Card>
        </AppLayout>
    );
}
