import { SystemMessageProvider } from '@/components/messages/message-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider, Layout, theme } from 'antd';
import { ReactNode } from 'react';
import { AppHeader } from './app/app-header';
import { AppSidebar } from './app/app-sidebar';

const { Content } = Layout;

const colorPrimary = '#1890ff';
const colorSuccess = '#52c41a';
const colorWarning = '#fa8c16';

const queryClient = new QueryClient();

type Props = {
    children?: ReactNode;
    navBarTitle?: string;
    navBarLeft?: ReactNode;
    navBarRight?: ReactNode;
};

export function AppLayout({ children, navBarTitle, navBarLeft, navBarRight }: Props) {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary,
                    colorSuccess,
                    colorWarning,
                    colorBgContainer,
                    colorBgLayout: '#ffffff',
                },
            }}
        >
            <SystemMessageProvider>
                <Layout style={{ minHeight: '100vh' }}>
                    <AppSidebar />
                    <Layout>
                        <AppHeader
                            title={navBarTitle}
                            leftContent={navBarLeft}
                            rightContent={navBarRight}
                        />
                        <Content>
                            <div
                                style={{
                                    padding: 24,
                                    minHeight: 360,
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: borderRadiusLG,
                                    border: '1px solid #e6f7ff',
                                }}
                            >
                                <App>
                                    <QueryClientProvider client={queryClient}>
                                        {children}
                                    </QueryClientProvider>
                                </App>
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </SystemMessageProvider>
        </ConfigProvider>
    );
}
