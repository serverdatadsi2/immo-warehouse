import { AddButton } from '@/components/buttons/crud-buttons';
import { useDebounce } from '@/hooks/use-debounce';
import { AppLayout } from '@/layouts/app-layout';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Storage } from '@/types/storage.type';
import { SearchOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { Card, Col, Input, Row, Select, Space, Typography } from 'antd';
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

const { Text } = Typography;

export default function StoragePage({ params, pagination }: PageProps) {
    const [filters, setFilters] = useState({
        search: params.search || '',
        location: params.location,
        status: params.status || 'All',
    });

    const applyInertiaFilter = useCallback(
        (key: keyof StorageFilters, value: string | undefined) => {
            const currentInertiaFilters = { ...params };
            const newFilters = { ...currentInertiaFilters, [key]: value };
            if (!value) delete newFilters[key];
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
                ...prev,
                [key]: value,
            }));
            if (key === 'search') debounce(value);
            else applyInertiaFilter(key, value);
        },
        [applyInertiaFilter, debounce],
    );

    const handleAdd = useCallback(() => {
        router.get('/storage-warehouse/assignment');
    }, []);

    return (
        <AppLayout navBarTitle="Penyimpanan Barang">
            <Head title="Penyimpanan Barang" />
            <Card
                style={{
                    background: '#f5faff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #1890ff11',
                    marginBottom: 24,
                }}
            >
                <Row gutter={24} align="middle" justify="space-between">
                    <Col>
                        <Space size={20}>
                            <div>
                                <Text strong style={{ color: '#1890ff' }}>
                                    🔍 Cari Barang
                                </Text>
                                <br />
                                <Input
                                    suffix={<SearchOutlined />}
                                    placeholder="Nama barang atau kode..."
                                    style={{ width: 500, marginTop: 4, borderRadius: 8 }}
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    allowClear
                                />
                            </div>
                            {/* <div>
                                <Text strong style={{ color: '#1890ff' }}>📍 Lokasi Barang</Text>
                                <Select
                                    placeholder="Filter Lokasi"
                                    style={{ width: 150, marginTop: 4, borderRadius: 8 }}
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
                                <Text strong style={{ color: '#1890ff' }}>
                                    🗂 Status
                                </Text>
                                <br />
                                <Select
                                    value={filters.status}
                                    onChange={(value) => handleFilterChange('status', value)}
                                    style={{ width: 120, marginTop: 4, borderRadius: 8 }}
                                >
                                    <Select.Option value="All">Semua</Select.Option>
                                    <Select.Option value="Good">Good</Select.Option>
                                    <Select.Option value="Bad">Bad</Select.Option>
                                </Select>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <AddButton onClick={handleAdd}>Assignment Item</AddButton>
                    </Col>
                </Row>
            </Card>
            <TableData pagination={pagination} />
        </AppLayout>
    );
}
