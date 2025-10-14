import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { StagingDetailWithRelation, StagingWithRelations } from '@/types/warehouse-staging.type';
import { Head } from '@inertiajs/react';
import { Card, Space } from 'antd';
import { DetailForm } from './components/detail/form';
import { DetailTable } from './components/detail/table';
import DescriptionHeader from './components/header/desctiption';
import { HeaderForm } from './components/header/form';

interface Props {
    headerData: StagingWithRelations;
    detailPagination: SimplePagination<StagingDetailWithRelation>;
    header: string;
}
const DetailComponent = ({ headerData, header, detailPagination }: Props) => {
    return (
        <AppLayout navBarLeft={<BackButton backUrl="/staging" />} navBarTitle="Detail Staging Area">
            <Head title="Detail Staging" />
            <Space direction="vertical" className="w-full" size={20}>
                {header ? (
                    <Space direction="vertical" className="w-full" size={20}>
                        <DescriptionHeader header={headerData} />
                        <Card
                            size="small"
                            style={{
                                background: '#f5faff',
                                boxShadow: '0 2px 8px #1890ff11',
                                paddingLeft: 20,
                            }}
                        >
                            <DetailForm header={header} />
                            <DetailTable pagination={detailPagination} />
                        </Card>
                    </Space>
                ) : (
                    <HeaderForm />
                )}
            </Space>
        </AppLayout>
    );
};

export default DetailComponent;
