import { AddButton } from '@/components/buttons/common-buttons';
import { DateDisplay } from '@/components/displays/date-display';
import { LaravelTable } from '@/components/tables/laravel-table';
import { appendQueryString } from '@/lib/utils';
import { EditOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Space, Table } from 'antd';
import { useCallback, useContext, useMemo, useState } from 'react';
import { DetailContext, DetailItem } from '../../detail';
import { DetailForm } from './form';

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
                render: (_: any, __: DetailItem, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Product',
                dataIndex: 'product_name',
                key: 'product_name',
            },
            {
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
            },
            {
                title: 'Expired Date',
                dataIndex: 'expired_date',
                key: 'expired_date',
                render: (v) => <DateDisplay val={v} />,
            },
            {
                title: 'Note',
                dataIndex: 'note',
                key: 'note',
            },
            {
                title: 'Action',
                key: 'action',
                fixed: 'right',
                render: (_, v) => (
                    <Button onClick={() => handleAction(v)} icon={<EditOutlined />} />
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
            <Space direction="vertical" className="w-full">
                <LaravelTable<DetailItem>
                    rowKey="id"
                    columns={columns}
                    onPageChange={handlePageChange}
                    pagination={pagination}
                    // hidePagination
                    summary={() => (
                        <>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>
                                    <b>Total Item</b>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={5}>
                                    {header?.quantity_item}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={6}></Table.Summary.Cell>
                            </Table.Summary.Row>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>
                                    <b>Grand Total</b>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={5}>
                                    {header?.grand_total}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={6}></Table.Summary.Cell>
                            </Table.Summary.Row>
                        </>
                    )}
                />
                <AddButton disabled={!header} onClick={handleAdd} />
            </Space>
            <DetailForm onClose={handleFormClose} open={formOpen} existingData={selectedData} />
        </>
    );
}
