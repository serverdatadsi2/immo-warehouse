import { AppLayout } from '@/layouts/app-layout';
import { Permission } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button, Card, Checkbox, Form, Input, message, Space } from 'antd';

interface CreateRoleProps {
    permissions: Permission[];
}

interface FormValues {
    name: string;
    permissions: string[];
}

export default function createrole({ permissions }: CreateRoleProps) {
    const { flash } = usePage().props;

    const [form] = Form.useForm();

    const onFinish = (values: FormValues) => {
        router.post(
            route('roles.store'),
            {
                name: values.name,
                permissions: values.permissions || [],
            },
            {
                onSuccess: () => {
                    message.success('Role created successfully!');
                    form.resetFields();
                },
                onError: (errors) => {
                    console.log(errors);
                    message.error('Failed to create role. Please check the form.');
                },
            },
        );
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <AppLayout navBarTitle="Create a new role with specific permissions">
            <Head title="Create Role" />
            <Card>
                <Form
                    form={form}
                    name="create-role"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Role Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the role name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Permissions" name="permissions">
                        <Checkbox.Group
                            style={{ width: '100%' }}
                            options={permissions.map((permission) => ({
                                label: permission.name,
                                value: permission.name,
                            }))}
                        />
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
