import { Card, Space, Typography } from 'antd';
import { ReactNode } from 'react';

const { Title, Text } = Typography;

type Props = {
    children: ReactNode;
};

export function AuthLayout({ children }: Props) {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                    'linear-gradient(135deg, #1890ff 0%, rgb(89, 134, 67) 50%, rgb(100, 73, 42) 100%)',
                padding: '20px',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 430,
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
                            Sistem Manajemen Warehouse dengan RFID
                        </Text>
                    </div>

                    {children}
                </Space>
            </Card>
        </div>
    );
}
