import { DateDisplay } from '@/components/displays/date-display';
import { MoneyDisplay } from '@/components/displays/money-display';
import { LaravelTable } from '@/components/tables/laravel-table';
import { AppLayout } from '@/layouts/app-layout';
import { Journal, JournalDetail } from '@/types/journal.type';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Head } from '@inertiajs/react';
import { Table, TableProps } from 'antd';
import { useCallback, useMemo } from 'react';
import { DetailChildTable } from './components/detail-child-table';

export default function Page({ pagination, grandTotalDebit, grandTotalCredit }: PageProps) {
    const columns = useMemo(
        (): TableProps<Item>['columns'] => [
            {
                title: 'Id',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: Item, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
                render: (v) => <DateDisplay val={v} />,
            },
            {
                title: 'Transaction Type',
                dataIndex: 'transaction_type',
                key: 'transaction_type',
            },
            {
                title: 'Transaction Number',
                dataIndex: 'transaction_number',
                key: 'transaction_number',
            },
            {
                title: 'Debit Total',
                dataIndex: 'debit_total',
                key: 'debit_total',
                render: (v) => <MoneyDisplay val={v} />,
            },
            {
                title: 'Credit Total',
                dataIndex: 'credit_total',
                key: 'credit_total',
                render: (v) => <MoneyDisplay val={v} />,
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
            },
        ],
        [pagination?.current_page, pagination?.per_page],
    );

    const expandedRowRender = useCallback((r: Item) => <DetailChildTable data={r.details} />, []);

    return (
        <AppLayout navBarTitle="Journals">
            <Head title="Journals" />
            <LaravelTable
                rowKey="id"
                columns={columns}
                pagination={pagination}
                expandable={{ expandedRowRender }}
                onPageChange={() => {}}
                summary={() => (
                    <>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={5}></Table.Summary.Cell>
                            <Table.Summary.Cell index={5}>
                                <b>Total</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={6}>
                                <MoneyDisplay val={grandTotalDebit} />
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={7}>
                                <MoneyDisplay val={grandTotalCredit} />
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={8}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </>
                )}
            />
        </AppLayout>
    );
}

export type DetailItem = JournalDetail & {};

type Item = Journal & {
    transaction_type_name: string;
    transaction_number: string;
    debit_total: string;
    credit_total: string;
    details: DetailItem[];
};

type PageProps = {
    pagination: LaravelPagination<Item> | null;
    grandTotalDebit: string | number | null;
    grandTotalCredit: string | number | null;
};
