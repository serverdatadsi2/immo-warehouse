import { AppLayout } from '@/layouts/app-layout';
import { Pannel } from '@/layouts/pannel';
import { ItemCondition } from '@/types/item-condition.type';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { LeftPannel } from './components/left-pannel';
import { RightPannel } from './components/right-pannel';

export default function InboundQC_RFID_UI() {
    const [condition, setCondition] = useState<ItemCondition>();
    const [scanning, setScanning] = useState<boolean>(false);
    return (
        <AppLayout navBarTitle="Inbound QC">
            <Head title="RFID Tagging" />
            <Pannel
                leftPanel={
                    <LeftPannel
                        scanning={scanning}
                        setScanning={setScanning}
                        setCondition={setCondition}
                    />
                }
                rightPannel={<RightPannel scanning={scanning} condition={condition} />}
            />
        </AppLayout>
    );
}
