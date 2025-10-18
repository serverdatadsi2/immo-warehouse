import { AddButton } from '@/components/buttons/crud-buttons';
import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { LocationSuggestion } from '@/types/location-suggestion.type';
import { router } from '@inertiajs/react';
import { Button, Card, Col, Row, TableProps, Typography } from 'antd';
import { Edit } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { LocationSuggestionForm } from './form';

const { Title, Text } = Typography;

interface Props {
    pagination: SimplePagination<LocationSuggestion> | null;
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
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: LocationSuggestion, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
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
                    <Button
                        type="primary"
                        icon={<Edit size={17} />}
                        onClick={() => handleEdit(record)}
                    />
                ),
            },
        ],
        [pagination],
    );

    return (
        <>
            <Card
                style={{
                    background: '#f5faff',
                    boxShadow: '0 2px 8px #1890ff11',
                    marginBottom: 16,
                }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={4} style={{ color: '#1890ff', marginBottom: 0 }}>
                            Daftar Location Sugestion
                        </Title>
                        <Text type="secondary">
                            Lengkapi Data terlebih dahulu untuk mendapatkan rekomendasi lengkap
                            lokasi penyimpanan barang.
                        </Text>
                    </Col>
                    <Col>
                        <AddButton onClick={handleAdd} />
                    </Col>
                </Row>
            </Card>
            <Card
                size="small"
                style={{
                    background: '#f5faff',
                    boxShadow: '0 2px 8px #1890ff11',
                }}
            >
                <CustomTable<LocationSuggestion>
                    size="small"
                    style={{ marginTop: '24px' }}
                    columns={columns}
                    dataSource={pagination?.data}
                    onPaginationChange={handlePageChange}
                    page={pagination?.current_page || 1}
                    bordered
                    rowKey="id"
                />
            </Card>

            <LocationSuggestionForm
                open={formOpen}
                onClose={handleFormClose}
                existingData={selectedItem}
            />
        </>
    );
}
