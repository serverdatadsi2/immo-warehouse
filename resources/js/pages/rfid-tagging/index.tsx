import { AppLayout } from '@/layouts/app-layout';
import { Pannel } from '@/layouts/pannel';
import { Head } from '@inertiajs/react';
import { LeftPannel } from './components/left-pannel';
import { RightPannel } from './components/right-pannel';
import { RfidTaggingProvider } from './context';

export default function Page() {
    return (
        <AppLayout navBarTitle="RFID Tagging">
            <Head title="RFID Tagging" />
            <RfidTaggingProvider>
                <Pannel
                    leftPanel={<LeftPannel />}
                    rightPannel={<RightPannel />}
                />
            </RfidTaggingProvider>
        </AppLayout>
    );
}
