import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { User } from '@/types/user.type';
import { Head } from '@inertiajs/react';
import DataTable from './components/table';
interface Props {
    pagination: SimplePagination<User>;
}

export default function Page({ pagination }: Props) {
    return (
        <AppLayout navBarTitle="Manage system users">
            <Head title="Users" />
            <DataTable pagination={pagination} />
        </AppLayout>
    );
}
