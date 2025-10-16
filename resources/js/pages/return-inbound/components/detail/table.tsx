import { AddButton } from '@/components/buttons/crud-buttons';
import { DateDisplay } from '@/components/displays/date-display';
import { LaravelTable } from '@/components/tables/laravel-table';
import { appendQueryString } from '@/lib/utils';
import { EditOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Card, Space, Table, Tag, Typography } from 'antd';
import { useCallback, useContext, useMemo, useState } from 'react';
import { DetailContext, DetailItem } from '../../detail';
import { DetailForm } from './form';

const { Title } = Typography;

export function DetailTable() {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<DetailItem>();

    const { detailsPagination: pagination, header } = useContext(DetailContext);

    const handleAction = useCallback((d: DetailItem) => {
        setSelectedData(d);
        setFormOpen(true);
    }, []);

    const columns = useMemo(
        (): TableProps<DetailItem>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: DetailItem, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Nama Produk',
                dataIndex: 'product_name',
                key: 'product_name',
                align: 'left',
            },
            {
                title: 'Jumlah',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
                render: (qty) => (
                    <Tag color="blue" style={{ fontWeight: 'bold' }}>
                        {qty}
                    </Tag>
                ),
            },
            {
                title: 'Expired Date',
                dataIndex: 'expired_date',
                key: 'expired_date',
                align: 'center',
                render: (v) => <DateDisplay val={v} />,
            },
            {
                title: 'Catatan',
                dataIndex: 'note',
                key: 'note',
                align: 'left',
            },
            {
                title: 'Aksi',
                key: 'action',
                fixed: 'right',
                align: 'center',
                render: (_, v) => (
                    <Button
                        onClick={() => handleAction(v)}
                        icon={<EditOutlined />}
                        type="primary"
                        style={{ borderRadius: 8 }}
                    />
                ),
            },
        ],
        [handleAction, pagination?.current_page, pagination?.per_page],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    const handleAdd = useCallback(() => {
        setFormOpen(true);
    }, []);

    const handleFormClose = useCallback(() => {
        setFormOpen(false);
        setSelectedData(undefined);
    }, []);

    return (
        <>
            <Card
                style={{
                    background: '#fff7e6',
                    boxShadow: '0 2px 8px #fffbe6',
                }}
            >
                <div className="flex justify-between">
                    <Title level={5} style={{ color: '#1890ff', marginBottom: 16 }}>
                        Detail Barang Inbound
                    </Title>
                    <AddButton disabled={!header} onClick={handleAdd}>
                        Tambah Detail Barang
                    </AddButton>
                </div>
                <Space direction="vertical" className="w-full">
                    <LaravelTable<DetailItem>
                        rowKey="id"
                        columns={columns}
                        onPageChange={handlePageChange}
                        pagination={pagination}
                        summary={() => (
                            <>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                                    <Table.Summary.Cell index={4}>
                                        <b>Total Item</b>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5}>
                                        <Tag color="blue">{header?.quantity_item}</Tag>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6}></Table.Summary.Cell>
                                </Table.Summary.Row>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                                    <Table.Summary.Cell index={4}>
                                        <b>Grand Total</b>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5}>
                                        <Tag color="gold">{header?.grand_total}</Tag>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6}></Table.Summary.Cell>
                                </Table.Summary.Row>
                            </>
                        )}
                    />
                </Space>
            </Card>
            <DetailForm onClose={handleFormClose} open={formOpen} existingData={selectedData} />
        </>
    );
}
