import { AppLayout } from '@/layouts/app-layout';
import { Role, Warehouse } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button, Card, Form, Input, InputPassword, Select, Space, Switch, message } from 'antd';

interface CreateUserProps {
    roles: Role[];
    warehouses: Warehouse[];
}

interface FormValues {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: string[];
    warehouses: string[];
    ecommerce_access: boolean;
    wms_access: boolean;
    backoffice_access: boolean;
    store_access: boolean;
}

export default function createuser({ roles, warehouses }: CreateUserProps) {
    const { flash } = usePage().props;

    const [form] = Form.useForm();

    const onFinish = (values: FormValues) => {
        router.post(
            route('users.store'),
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
                    message.success('User created successfully!');
                    form.resetFields();
                },
                onError: (errors) => {
                    console.log(errors);
                    message.error('Failed to create user. Please check the form.');
                },
            },
        );
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <AppLayout navBarTitle="Create a new system user">
            <Head title="Create User" />
            <Card>
                <Form
                    form={form}
                    name="create-user"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{
                        ecommerce_access: false,
                        wms_access: false,
                        backoffice_access: false,
                        store_access: false,
                    }}
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

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input the password!' }]}
                    >
                        <InputPassword />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="password_confirmation"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
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
                        <InputPassword />
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
                                Submit
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
