import { AddButton } from '@/components/buttons/crud-buttons';
import { useDebounce } from '@/hooks/use-debounce';
import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Storage } from '@/types/storage.type';
import { SearchOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { Card, Input, Select, Space } from 'antd';
import { useCallback, useState } from 'react';
import TableData from './components/table';

interface StorageFilters {
    search?: string;
    location?: string;
    status?: 'All' | 'Good' | 'Bad';
}

interface PageProps {
    params: StorageFilters;
    pagination: SimplePagination<Storage> | null;
}

export default function StoragePage({ params, pagination }: PageProps) {
    const [filters, setFilters] = useState({
        search: params.search || '',
        location: params.location,
        status: params.status || 'All',
    });

    const applyInertiaFilter = useCallback(
        (key: keyof StorageFilters, value: string | undefined) => {
            const currentInertiaFilters = { ...params };

            const newFilters = {
                ...currentInertiaFilters,
                [key]: value,
            };

            if (!value) {
                delete newFilters[key];
            }

            router.get(route(route().current() ?? 'storage.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [params],
    );

    const debounce = useDebounce((val: string) => {
        applyInertiaFilter('search', val);
    }, 300);

    const handleFilterChange = useCallback(
        (key, value) => {
            setFilters((prev) => ({
                status: key === 'status' ? value : (prev?.status ?? ''),
                search: key === 'search' ? value : (prev?.search ?? ''),
                location: key === 'location' ? value : (prev?.location ?? ''),
            }));
            if (key === 'search') debounce(value);
            applyInertiaFilter(key, value);
        },
        [applyInertiaFilter, debounce],
    );

    const handleAdd = useCallback(() => {
        router.get('/storage-warehouse/assignment');
    }, []);

    return (
        <AppLayout navBarTitle="Penyimpanan Barang">
            <Head title="Penyimpanan Barang" />
            <Card>
                <div className="flex justify-between">
                    <Space size={20}>
                        <div>
                            Cari Barang <br />
                            <Input
                                suffix={<SearchOutlined />}
                                placeholder="Cari Nama Barang ..."
                                style={{ width: 500 }}
                                value={filters.search}
                                onChange={(e) => {
                                    handleFilterChange('search', e.target.value);
                                }}
                                allowClear
                            />
                        </div>
                        {/* <div>
                            Lokasi Barang <br />
                            <Select
                                placeholder="Filter Lokasi"
                                style={{ width: 150 }}
                                value={filters.location}
                                onChange={(v) => handleFilterChange('location', v)}
                                options={[
                                    { value: 'A1', label: 'Zona A1' },
                                    { value: 'B2', label: 'Zona B2' },
                                ]}
                                allowClear
                            />
                        </div> */}

                        <div>
                            Status
                            <br />
                            <Select
                                value={filters?.status || 'All'}
                                onChange={(value) => handleFilterChange('status', value)}
                                style={{ width: 90 }}
                            >
                                <Select.Option value="All">Semua</Select.Option>
                                <Select.Option value="Good">Good</Select.Option>
                                <Select.Option value="Bad">Bad</Select.Option>
                            </Select>
                        </div>
                    </Space>
                    <AddButton onClick={handleAdd}>Assignment Item</AddButton>
                </div>
            </Card>
            <TableData pagination={pagination} />
        </AppLayout>
    );
}
