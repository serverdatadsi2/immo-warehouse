import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, Card, Form, Input, Space, Typography, message } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

interface LoginFormData {
    username: string;
    password: string;
    remember?: boolean;
    [key: string]: any;
}

const LoginPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values: LoginFormData) => {
        setLoading(true);
        try {
            router.post('/login', values, {
                onSuccess: () => {
                    message.success('Login berhasil!');
                },
                onError: (errors) => {
                    if (errors.username) {
                        message.error(errors.username);
                    } else if (errors.password) {
                        message.error(errors.password);
                    } else {
                        message.error('Login gagal. Periksa kredensial Anda.');
                    }
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch {
            setLoading(false);
            message.error('Terjadi kesalahan saat login');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                    'linear-gradient(135deg, #1890ff 0%,rgb(89, 134, 67) 50%,rgb(100, 73, 42) 100%)',
                padding: '20px',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    border: 'none',
                }}
                styles={{ body: { padding: '40px' } }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title
                            level={2}
                            style={{ margin: 0, color: '#1890ff', fontWeight: 'bold' }}
                        >
                            Immo Warehouse
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            Sistem Manajemen Gudang dengan RFID
                        </Text>
                    </div>

                    <Form
                        form={form}
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        autoComplete="off"
                    >
                        <Form.Item
                            name="username"
                            label="Username"
                            rules={[{ required: true, message: 'Username harus diisi!' }]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Masukkan username Anda"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Password harus diisi!' },
                                // { min: 6, message: 'Password minimal 6 karakter!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Masukkan password Anda"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{
                                    width: '100%',
                                    height: '45px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    background:
                                        'linear-gradient(135deg, #1890ff 0%, rgb(89, 134, 67) 50%, rgb(100, 73, 42) 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                                }}
                            >
                                {loading ? 'Memproses...' : 'Masuk ke Sistem'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
            </Card>
        </div>
    );
};

export default LoginPage;
