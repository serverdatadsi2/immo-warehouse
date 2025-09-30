import { AddButton } from '@/components/buttons/crud-buttons';
import { AppLayout } from '@/layouts/app-layout';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { TransactionType } from '@/types/transaction-type.type';
import { Head } from '@inertiajs/react';
import { Space } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { DataTable } from './components/data-table';
import { FormPopup } from './components/form-popup';

export default function Page({ pagination }: PageProps) {
    const [formOpen, setFormOpen] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<Item>();

    const handleOpenform = useCallback(() => {
        setFormOpen(true);
    }, []);

    const handleCloseForm = useCallback(() => {
        setFormOpen(false);
        setSelectedItem(undefined);
    }, []);

    const handleFormSuccess = useCallback(() => {
        handleCloseForm();
    }, [handleCloseForm]);

    const handleItemAction = useCallback((d: Item) => {
        setFormOpen(false);
        setSelectedItem(d);
    }, []);

    useEffect(() => {
        if (selectedItem) {
            setFormOpen(true);
        } else {
            setFormOpen(false);
        }
    }, [selectedItem]);

    return (
        <AppLayout navBarTitle="Transaction Type">
            <Head title="Transaction Type" />
            <Space direction="vertical" style={{ width: '100%' }}>
                <AddButton onClick={handleOpenform} disabled />
                <DataTable onAction={handleItemAction} pagination={pagination} />
            </Space>
            <FormPopup
                existingData={selectedItem}
                onSuccess={handleFormSuccess}
                open={formOpen}
                onClose={handleCloseForm}
            />
        </AppLayout>
    );
}

export type Item = TransactionType;

type PageProps = {
    pagination?: LaravelPagination<Item>;
};
