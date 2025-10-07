import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { Pannel } from '@/layouts/pannel';
import { UnsignProductLocation } from '@/types/storage.type';
import { Head } from '@inertiajs/react';
import { LeftPannel } from './components/left-pannel';
import RightPannel from './components/right-pannel';

interface Props {
    data: UnsignProductLocation[];
}

export default function AssignmentPage({ data }: Props) {
    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/storage-warehouse" />}
            navBarTitle="Lokasi Penyimpanan Barang"
        >
            <Head title="Lokasi Penyimpanan Barang" />
            <Pannel leftPanel={<LeftPannel data={data} />} rightPannel={<RightPannel />} />
        </AppLayout>
    );
}
