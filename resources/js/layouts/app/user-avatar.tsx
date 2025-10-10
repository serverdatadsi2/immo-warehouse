import { SharedData } from '@/types';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { router, usePage } from '@inertiajs/react';
import { Avatar, Button, Popover, Space, Typography } from 'antd';
import { useCallback } from 'react';

export function UserAvatar() {
    return (
        <Popover content={<UserPopoverContent />} trigger="click">
            <Button icon={<Avatar icon={<UserOutlined />} />} type="text" size="large" />
        </Popover>
    );
}

function UserPopoverContent() {
    const { props } = usePage<SharedData>();

    const onLogout = useCallback(() => {
        router.post('/logout');
    }, []);

    return (
        <Space direction="vertical" size={15} className="text-center">
            <Space direction="vertical" size={0.5}>
                <Typography.Text strong>{props.auth.user.name}</Typography.Text>
                <span className="!text-xs text-gray-500">{props.auth.warehouses[0].name}</span>
            </Space>
            <Button
                onClick={onLogout}
                danger
                type="primary"
                icon={<LogoutOutlined />}
                style={{
                    background: 'linear-gradient(135deg, #ff4d4f 0%, #fa8c16 100%)',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)',
                }}
            >
                Logout
            </Button>
        </Space>
    );
}
