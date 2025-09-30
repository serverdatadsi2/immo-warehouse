import { AddButton } from '@/components/buttons/crud-buttons';
import { LaravelTable } from '@/components/tables/laravel-table';
import { appendQueryString } from '@/lib/utils';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { LocationSuggestion } from '@/types/location-suggestion.type';
import { router } from '@inertiajs/react';
import { Button, TableProps } from 'antd';
import { Edit } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { LocationSuggestionForm } from './form';

interface Props {
    pagination: LaravelPagination<LocationSuggestion> | null;
}

export default function TableData({ pagination }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<LocationSuggestion>();

    const handleEdit = (item: LocationSuggestion) => {
        setSelectedItem(item);
        setFormOpen(true);
    };

    const handleAdd = useCallback(() => {
        setSelectedItem(undefined);
        setFormOpen(true);
    }, []);

    const handleFormClose = useCallback(() => {
        setFormOpen(false);
        setSelectedItem(undefined);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    const columns = useMemo(
        (): TableProps<LocationSuggestion>['columns'] => [
            {
                title: 'Product',
                dataIndex: 'product_name',
                key: 'product',
            },
            {
                title: 'Product Code',
                dataIndex: 'product_code',
                key: 'product_code',
            },
            {
                title: 'Location',
                key: 'location',
                render: (record: LocationSuggestion) => {
                    const parts: string[] = [];
                    if (record.room_name) parts.push(record?.room_name);
                    if (record.rack_name) parts.push(record?.rack_name);
                    if (record.layer_name) parts.push(record?.layer_name);

                    return parts.join(' > ');
                },
            },
            {
                title: 'Actions',
                key: 'actions',
                render: (record: LocationSuggestion) => (
                    <Button icon={<Edit size={17} />} onClick={() => handleEdit(record)} />
                ),
            },
        ],
        [],
    );

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <AddButton onClick={handleAdd} />
            </div>

            <LaravelTable<LocationSuggestion>
                columns={columns}
                dataSource={pagination?.data}
                rowKey="id"
                pagination={pagination}
                onPageChange={handlePageChange}
            />
            {/* </Card> */}

            <LocationSuggestionForm
                open={formOpen}
                onClose={handleFormClose}
                existingData={selectedItem}
            />
        </div>
    );
}
