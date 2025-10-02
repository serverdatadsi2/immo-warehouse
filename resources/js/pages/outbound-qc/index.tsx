import { AppLayout } from '@/layouts/app-layout';
import { Pannel } from '@/layouts/pannel';
import { Outbound } from '@/types/outbound.type';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { LeftPannel } from './components/left-pannel';
import { RightPannel } from './components/right-pannel';

export default function Page() {
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    return (
        <AppLayout navBarTitle="Outbound QC">
            <Head title="Outbound QC" />
            <Pannel
                leftPanel={
                    <LeftPannel selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
                }
                rightPannel={<RightPannel selectedOrder={selectedOrder} />}
            />
        </AppLayout>
    );
}

export type HeaderItem = Outbound;
