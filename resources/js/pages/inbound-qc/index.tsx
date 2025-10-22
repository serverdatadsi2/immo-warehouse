import { AppLayout } from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import MonitoringComponent from './components/monitoring';

export default function InboundQCPage() {
    return (
        <AppLayout navBarTitle="Monitoring Inbound QC">
            <Head title="Inbound QC" />
            <MonitoringComponent />
        </AppLayout>
    );
}
