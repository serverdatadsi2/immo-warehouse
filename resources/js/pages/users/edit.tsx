import { AppLayout } from '@/layouts/app-layout';
import { Role, User, Warehouse } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button, Card, Form, Input, Select, Space, Switch, message } from 'antd';

interface EditUserProps {
    user: User;
    roles: Role[];
    warehouses: Warehouse[];
}

interface FormValues {
    name: string;
    username: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    roles: string[];
    warehouses: string[];
    ecommerce_access: boolean;
    wms_access: boolean;
    backoffice_access: boolean;
    store_access: boolean;
}

export default function edituser({ user, roles, warehouses }: EditUserProps) {
    const { flash } = usePage().props;

    const [form] = Form.useForm();

    // Set initial values for the form
    const initialValues: FormValues = {
        name: user.name,
        username: user.username,
        email: user.email,
        roles: user.roles,
        warehouses: Object.keys(user.warehouses || {})
            .map(Number)
            .map(String), // Convert object keys to array of string ids
        ecommerce_access: user.ecommerce_access,
        wms_access: user.wms_access,
        backoffice_access: user.backoffice_access,
        store_access: user.store_access,
    };

    const onFinish = (values: FormValues) => {
        router.put(
            route('users.update', user.id),
            {
                name: values.name,
                username: values.username,
                email: values.email,
                password: values.password,
                password_confirmation: values.password_confirmation,
                roles: values.roles || [],
                warehouses: values.warehouses || [],
                ecommerce_access: values.ecommerce_access || false,
                wms_access: values.wms_access || false,
                backoffice_access: values.backoffice_access || false,
                store_access: values.store_access || false,
            },
            {
                onSuccess: () => {
                    message.success('User updated successfully!');
                },
                onError: (errors) => {
                    console.log(errors);
                    message.error('Failed to update user. Please check the form.');
                },
            },
        );
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <AppLayout navBarTitle={`Editing user: ${user.name}`}>
            <Head title={`Edit User - ${user.name}`} />

            <Card>
                <Form
                    form={form}
                    name="edit-user"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={initialValues}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the user name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input the username!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                type: 'email',
                                message: 'Please input a valid email!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="New Password" name="password">
                        <Input.Password placeholder="Leave blank to keep current password" />
                    </Form.Item>

                    <Form.Item
                        label="Confirm New Password"
                        name="password_confirmation"
                        dependencies={['password']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error('The two passwords do not match!'),
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item label="Roles" name="roles">
                        <Select
                            mode="multiple"
                            placeholder="Select roles"
                            options={roles.map((role) => ({
                                label: role.name,
                                value: role.name,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label="Warehouses" name="warehouses">
                        <Select
                            mode="multiple"
                            placeholder="Select warehouses"
                            options={warehouses.map((warehouse) => ({
                                label: warehouse.name,
                                value: warehouse.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ecommerce Access"
                        name="ecommerce_access"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item label="WMS Access" name="wms_access" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        label="Backoffice Access"
                        name="backoffice_access"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item label="Store Access" name="store_access" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Update
                            </Button>
                            <Button htmlType="button" onClick={() => form.resetFields()}>
                                Reset
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </AppLayout>
    );
}
