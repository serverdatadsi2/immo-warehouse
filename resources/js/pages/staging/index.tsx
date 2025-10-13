import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Params } from '@/types/receiving-order.type';
import { StagingWithDetailRelations } from '@/types/warehouse-staging.type';
import { Head } from '@inertiajs/react';
import { Activity, Boxes, CheckCircle, Package } from 'lucide-react';
import { Filters } from './components/filters';
import StagingTable from './components/stage-table';
import { StatCard } from './components/state-card';

interface Props {
    pagination: SimplePagination<StagingWithDetailRelations>;
    params: Params;
}

export default function StagingPage({ pagination, params }: Props) {
    return (
        <AppLayout navBarTitle="RFID Staging Area">
            <Head title="Staging" />
            <main className="">
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Items"
                        value="435"
                        icon={Package}
                        trend={{ value: '12% from last week', positive: true }}
                    />
                    <StatCard
                        title="Active Staging"
                        value="3"
                        icon={Boxes}
                        trend={{ value: '2 new today', positive: true }}
                    />
                    <StatCard
                        title="Completed"
                        value="1,247"
                        icon={CheckCircle}
                        trend={{ value: '8% increase', positive: true }}
                    />
                    <StatCard
                        title="Scan Rate"
                        value="98.5%"
                        icon={Activity}
                        trend={{ value: '0.5% improvement', positive: true }}
                    />
                </div>

                {/* RFID Readers */}
                {/* <div className="mb-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        RFID Readers Status
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RFIDScanner readerId="RDR-001" status="active" />
                        <RFIDScanner readerId="RDR-002" status="inactive" />
                    </div>
                </div> */}
                <Filters params={params} />

                {/* Staging Table */}
                <div className="mb-8">
                    <StagingTable pagination={pagination} />
                </div>
            </main>
        </AppLayout>
    );
}
