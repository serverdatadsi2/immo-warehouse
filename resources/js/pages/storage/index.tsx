import { AppLayout } from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import TableData from './components/table';

// interface PageProps {
//     pagination: LaravelPagination<Storage> | null;
// }

export default function StoragePage() {
    return (
        <AppLayout navBarTitle="Penyimpanan Barang">
            <Head title="Penyimpanan Barang" />
            {/* <Button onClick={handleAdd} type="primary" icon={<PlusOutlined />}>
            Add Inbound
        </Button> */}
            {/* <TableData pagination={pagination} /> */}
            <TableData />
        </AppLayout>
    );
}
