import axiosIns from '@/lib/axios';
import { MenuCounts } from '@/types/menu.type';
import { router, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { Button, Layout, Menu } from 'antd';
import { Warehouse } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { getMenuItems } from './menu-items';

const { Sider } = Layout;

export function AppSidebar() {
    const { url } = usePage();

    const selectedMenu = useMemo(() => {
        const basePath = url.split('?')[0];
        return basePath.split('/').filter((d) => d);
    }, [url]);

    const handleClick = useCallback(() => {
        router.get('/');
    }, []);

    const { data } = useQuery({
        queryKey: ['all-menu-counts'],
        queryFn: async () => {
            const res = await axiosIns.get<MenuCounts>('/all-menu-counts');
            return res.data;
        },
    });

    const menuItems = useMemo(() => getMenuItems(data), [data]);

    return (
        <Sider
            trigger={null}
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'sticky',
                insetInlineStart: 0,
                top: 0,
                bottom: 0,
                scrollbarWidth: 'thin',
                scrollbarGutter: 'stable',
            }}
        >
            <div className="demo-logo-vertical" />
            <div className="pt-3 mb-5 text-center">
                <Button
                    onClick={handleClick}
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
    );
}
