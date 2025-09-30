import { SystemMessageProvider } from '@/components/messages/message-provider';
import { SharedData } from '@/types';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { router, usePage } from '@inertiajs/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    Avatar,
    Button,
    Col,
    ConfigProvider,
    Layout,
    Menu,
    Popover,
    Row,
    Space,
    theme,
} from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import {
    Database,
    Download,
    LassoSelect,
    Map,
    NotebookText,
    QrCode,
    Warehouse,
} from 'lucide-react';
import { ReactNode, useCallback, useMemo } from 'react';

const { Header, Sider, Content } = Layout;

const colorPrimary = '#1890ff';
const colorSuccess = '#52c41a';
const colorWarning = '#fa8c16';

const queryClient = new QueryClient();

function getMenuItem({ key, icon, label, url, children }: MenuItemParam): ItemType<MenuItemType> {
    return {
        key,
        icon,
        label,
        children,
        onClick: children
            ? undefined
            : () => {
                  router.get(url ?? '');
              },
    };
}

const menuItems = [
    getMenuItem({
        key: 'master',
        icon: <Database size={20} />,
        label: 'Master',
        children: [
            // getMenuItem({
            //     key: 'transaction-types',
            //     icon: <DatabaseOutlined />,
            //     label: 'Transaction Type',
            //     url: '/master/transaction-types',
            // }),
            getMenuItem({
                key: 'location-suggestions',
                icon: <Map size={17} />,
                label: 'Location Suggestions',
                url: '/master/location-suggestions',
            }),
            // getMenuItem({
            //     key: 'users',
            //     icon: <UsersRound size={17} />,
            //     label: 'Users',
            //     url: '/master/users',
            // }),
        ],
    }),
    getMenuItem({
        key: 'inbounds',
        icon: <Download size={17} />,
        label: 'Inbound',
        url: '/inbounds',
    }),
    getMenuItem({
        key: 'rfid-tagging',
        icon: <QrCode size={17} />,
        label: 'RFID Tagging',
        url: '/rfid-tagging',
    }),
    getMenuItem({
        key: 'inbound-qc',
        icon: <LassoSelect size={17} />,
        label: 'Inbound QC',
        url: '/inbound-qc',
    }),
    getMenuItem({
        key: 'receiving-order',
        icon: <NotebookText size={17} />,
        label: 'Receiving Orders',
        url: '/receiving-order',
    }),
    // getMenuItem({
    //     key: 'search-product',
    //     icon: <Search size={17} />,
    //     label: 'Search Product',
    //     url: '/search-product',
    // }),
    // getMenuItem({
    //     key: 'outbound-qc',
    //     icon: <Lasso size={17} />,
    //     label: 'Outbound QC',
    //     url: '/outbound-qc',
    // }),
];

export function AppLayout({ children, navBarTitle, navBarLeft, navBarRight }: Props) {
    const {
        token: { colorBgContainer, borderRadiusLG, sizeMD, fontWeightStrong },
    } = theme.useToken();
    const { url } = usePage();

    const selectedMenu = useMemo(() => {
        const basePath = url.split('?')[0];
        return basePath.split('/').filter((d) => d);
    }, [url]);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary,
                    colorSuccess,
                    colorWarning,
                    colorBgContainer,
                    // colorBgContainer: '#f8fafc',
                    colorBgLayout: '#ffffff',
                },
            }}
        >
            <SystemMessageProvider>
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider
                        trigger={null}
                        style={{
                            overflow: 'auto',
                            height: '100vh',
                            position: 'sticky',
                            insetInlineStart: 0,
                            // backgroundColor: 'blue',
                            // background: 'linear-gradient(135deg, #1890ff 0%, rgb(89, 134, 67) 50%, rgb(100, 73, 42) 100%)',
                            top: 0,
                            bottom: 0,
                            scrollbarWidth: 'thin',
                            scrollbarGutter: 'stable',
                        }}
                    >
                        <div className="demo-logo-vertical" />
                        <div className="pt-3 mb-5 text-center">
                            <Button
                                type="text"
                                icon={<Warehouse />}
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgb(89, 134, 67) 0, #1890ff 70%, rgb(123, 187, 63) 90%)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    padding: '23px 12px 23px 12px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                                    border: 'none',
                                }}
                            >
                                Immo Warehouse
                            </Button>
                        </div>
                        <Menu
                            theme="dark"
                            mode="inline"
                            items={menuItems}
                            defaultSelectedKeys={selectedMenu}
                            defaultOpenKeys={selectedMenu}
                        />
                    </Sider>
                    <Layout>
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
                                    {navBarLeft}
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
                                        {navBarTitle}
                                    </span>
                                </Col>
                                <Col style={{ textAlign: 'center' }} span={2}>
                                    <Space>
                                        <Popover content={UserPopoverContent} trigger="click">
                                            <Button
                                                icon={<Avatar icon={<UserOutlined />} />}
                                                type="text"
                                                size="large"
                                            />
                                        </Popover>
                                        {navBarRight}
                                    </Space>
                                </Col>
                            </Row>
                        </Header>
                        <Content style={{ margin: '0 16px' }}>
                            <div
                                style={{
                                    marginTop: '1rem',
                                    padding: 24,
                                    minHeight: 360,
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: borderRadiusLG,
                                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.08)',
                                    border: '1px solid #e6f7ff',
                                }}
                            >
                                <QueryClientProvider client={queryClient}>
                                    {children}
                                </QueryClientProvider>
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </SystemMessageProvider>
        </ConfigProvider>
    );
}

type MenuItemParam = {
    key: string;
    icon: ReactNode;
    label: string;
    url?: string;
    children?: ItemType<MenuItemType>[] | undefined;
};

function UserPopoverContent() {
    const { props } = usePage<SharedData>();

    const onLogout = useCallback(() => {
        router.post('/logout');
    }, []);

    return (
        <Space direction="vertical">
            <span className="font-bold">{props.auth.user.name}</span>
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

type Props = {
    children?: ReactNode;
    navBarTitle?: string;
    navBarLeft?: ReactNode;
    navBarRight?: ReactNode;
};
