import { LocationSuggestion } from '@/types/location-suggestion.type';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import TableData from './components/table';
import { LaravelPagination } from '@/types/laravel-pagination.type';

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