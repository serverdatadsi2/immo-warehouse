import { Col, Layout, Row, Space, theme } from 'antd';
import { ReactNode } from 'react';
import { UserAvatar } from './user-avatar';

const { Header } = Layout;

type Props = {
    title?: string;
    leftContent?: ReactNode;
    rightContent?: ReactNode;
};

export function AppHeader({ title, leftContent, rightContent }: Props) {
    const {
        token: { sizeMD, fontWeightStrong },
    } = theme.useToken();

    const colorPrimary = '#1890ff';

    return (
        <Header
            style={{
                padding: 0,
                background: 'linear-gradient(90deg, #f8fafc 0%, #e6f7ff 100%)',
                borderBottom: '1px solid #e6f7ff',
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.1)',
            }}
        >
            <Row className="w-full">
                <Col style={{ textAlign: 'center' }} span={2}>
                    {leftContent}
                </Col>
                <Col span={20}>
                    <span
                        style={{
                            fontSize: sizeMD,
                            fontWeight: fontWeightStrong,
                            color: colorPrimary,
                            textShadow: '0 1px 2px rgba(24, 144, 255, 0.1)',
                        }}
                    >
                        {title}
                    </span>
                </Col>
                <Col style={{ textAlign: 'center' }} span={2}>
                    <Space>
                        <UserAvatar />
                        {rightContent}
                    </Space>
                </Col>
            </Row>
        </Header>
    );
}
