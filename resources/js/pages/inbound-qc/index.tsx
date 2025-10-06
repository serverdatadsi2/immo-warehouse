import { AppLayout } from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import TableMonitoring from './components/table-monitoring';

export default function InboundQCPage() {
    return (
        <AppLayout navBarTitle="Monitoring Inbound QC">
            <Head title="Inbound QC" />
            <TableMonitoring />
        </AppLayout>
    );
}
