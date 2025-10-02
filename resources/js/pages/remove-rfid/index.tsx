import { AppLayout } from '@/layouts/app-layout';
import { Pannel } from '@/layouts/pannel';
import { Head } from '@inertiajs/react';
import { LeftPannel } from './components/left-pannel';
import { RightPannel } from './components/right-pannel';
import { RemoveRfidProvider } from './context';

export default function RemoveRfidPage() {
    return (
        <AppLayout navBarTitle="Remove RFID">
            <Head title="Remove RFID" />
            <RemoveRfidProvider>
                <Pannel leftPanel={<LeftPannel />} rightPannel={<RightPannel />} />
            </RemoveRfidProvider>
        </AppLayout>
    );
}
