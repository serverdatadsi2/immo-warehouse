import { BackButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { Pannel } from '@/layouts/pannel';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { LeftPannel } from './components/left-pannel';
import { RightPannel } from './components/right-pannel';

export default function AssignmentPage() {
    const [scannedLocation, setScannedLocation] = useState<string | null>(null);
    const [scannedItems, setScannedItems] = useState<any[]>([]);
    const [storageData, setStorageData] = useState<any[]>([]);
    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/storage-warehouse" />}
            navBarTitle="Lokasi Penyimpanan Barang"
        >
            <Head title="Lokasi Penyimpanan Barang" />
            <Pannel
                leftPanel={<LeftPannel storageData={storageData} />}
                rightPannel={
                    <RightPannel
                        scannedLocation={scannedLocation}
                        setScannedLocation={setScannedLocation}
                        scannedItems={scannedItems}
                        setScannedItems={setScannedItems}
                        setStorageData={setStorageData}
                    />
                }
            />
        </AppLayout>
    );
}
