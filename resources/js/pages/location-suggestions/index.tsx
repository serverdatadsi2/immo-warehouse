import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { LocationSuggestion } from '@/types/location-suggestion.type';
import { Head } from '@inertiajs/react';
import TableData from './components/table';

interface PageProps {
    pagination: LaravelPagination<LocationSuggestion> | null;
}

export default function LocationSuggestionsPage({ pagination }: PageProps) {
    return (
        <AppLayout navBarTitle="Location Suggestions">
            <Head title="Location Suggestions" />
            {/* <Button onClick={handleAdd} type="primary" icon={<PlusOutlined />}>
            Add Inbound
        </Button> */}
            <TableData pagination={pagination} />
        </AppLayout>
    );
}
