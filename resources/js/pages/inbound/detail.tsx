import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { InboundDetail } from '@/types/inbound.type';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Head } from '@inertiajs/react';
import { Space } from 'antd';
import { createContext } from 'react';
import { HeaderItem } from '.';
import { DetailTable } from './components/detail/table';
import { HeaderForm } from './components/header/form';

export const DetailContext = createContext<PageProps>({ detailsPagination: null, header: null });

export default function Page({ detailsPagination, header }: PageProps) {
    // const [messageApi, contextHolder] = message.useMessage();

    // const handleDestroy = useCallback(() => {
    //     router.delete(`/formulas/${header?.id}`, {
    //         onSuccess: () => {
    //             messageApi.success('Success delete Formula.');
    //         },
    //         onError: () => {
    //             messageApi.error('Failed to delete Formula!');
    //         },
    //     });
    // }, [header?.id, messageApi]);

    return (
        <AppLayout navBarLeft={<BackButton backUrl="/inbounds" />} navBarTitle="Inbound Detail">
            {/* {contextHolder} */}
            <Head title="Inbound Detail" />
            <DetailContext.Provider value={{ detailsPagination, header }}>
                <Space direction="vertical" className="w-full">
                    <HeaderForm />
                    <DetailTable />
                </Space>
            </DetailContext.Provider>
        </AppLayout>
    );
}

export type DetailItem = InboundDetail;

type PageProps = {
    header: Partial<HeaderItem> | null;
    detailsPagination: LaravelPagination<DetailItem> | null;
};
