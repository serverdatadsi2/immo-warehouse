import { BackButton } from '@/components/buttons/crud-buttons';
import { usePermission } from '@/hooks/use-permission';
import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { StockOpnameDetailWithRelation } from '@/types/stock-opname.type';
import { QrcodeOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Button, Card, Space, Typography } from 'antd';
import { createContext, useState } from 'react';
import { HeaderItem } from '.';
import BadLabelingModal from './components/detail/bad-labeling';
import { DetailTable } from './components/detail/table';
import DescriptionHeader from './components/header/desctiption';

export const DetailContext = createContext<PageProps>({
    detailsPagination: null,
    header: null,
});

export default function Page({ detailsPagination, header }: PageProps) {
    const { hasPermission } = usePermission();
    const [visible, setVisible] = useState(false);

    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/stock-opname" />}
            navBarTitle="Monitoring Stock Opname"
        >
            <Head title="Stock Opname" />
            <DetailContext.Provider value={{ detailsPagination, header }}>
                <Space direction="vertical" className="w-full" size="large">
                    <Card
                        style={{
                            background: 'linear-gradient(90deg, #e3f0ff 0%, #fff 100%)',
                            boxShadow: '0 4px 24px #1890ff22',
                            marginBottom: 8,
                        }}
                    >
                        <DescriptionHeader />
                    </Card>
                    <Card
                        size="small"
                        style={{
                            background: '#f5faff',
                            boxShadow: '0 2px 8px #1890ff11',
                        }}
                    >
                        <div className="flex justify-between">
                            <Typography.Title
                                level={5}
                                style={{
                                    color: '#1890ff',
                                    marginLeft: 20,
                                    marginTop: 5,
                                    marginBottom: -10,
                                }}
                            >
                                Detail Stock Opname
                            </Typography.Title>
                            {header?.status !== 'completed' &&
                                hasPermission('stock_opname.bad_labeling') && (
                                    <Button
                                        danger
                                        type="primary"
                                        onClick={() => setVisible(true)}
                                        style={{
                                            // width: '100%',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 8px #ff4d4f22',
                                        }}
                                        icon={<QrcodeOutlined />}
                                    >
                                        Bad Label Item
                                    </Button>
                                )}
                        </div>
                        <DetailTable />
                    </Card>
                </Space>

                <BadLabelingModal visible={visible} onClose={() => setVisible(false)} />
            </DetailContext.Provider>
        </AppLayout>
    );
}

export type DetailItem = StockOpnameDetailWithRelation;

type PageProps = {
    header: Partial<HeaderItem> | null;
    detailsPagination: LaravelPagination<DetailItem> | null;
};
