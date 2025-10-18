import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { LocationSuggestion } from '@/types/location-suggestion.type';
import { Head } from '@inertiajs/react';
import TableData from './components/table';

interface PageProps {
    pagination: SimplePagination<LocationSuggestion> | null;
}

export default function LocationSuggestionsPage({ pagination }: PageProps) {
    return (
        <AppLayout navBarTitle="Location Suggestions">
            <Head title="Location Suggestions" />
            <TableData pagination={pagination} />
        </AppLayout>
    );
}
