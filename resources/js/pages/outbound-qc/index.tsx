import { AppLayout } from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import LogTable from './components/table';

export default function Page() {
    return (
        <AppLayout navBarTitle="Monitoring Outbound QC">
            <Head title="Outbound QC" />

            <LogTable />
        </AppLayout>
    );
}
