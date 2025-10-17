import { AppLayout } from '@/layouts/app-layout';
import { Pannel } from '@/layouts/pannel';
import { Head } from '@inertiajs/react';
import { ReturnInboundDetail } from './components/return-inbound-detail';
import { SupplierInbound } from './components/supplier-inbound';
import { RfidTaggingProvider } from './context';

export default function Page() {
    return (
        <AppLayout navBarTitle="RFID Tagging">
            <Head title="RFID Tagging" />
            <RfidTaggingProvider>
                <Pannel leftPanel={<SupplierInbound />} rightPannel={<ReturnInboundDetail />} />
            </RfidTaggingProvider>
        </AppLayout>
    );
}
