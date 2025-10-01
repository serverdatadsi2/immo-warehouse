import { LaravelTable } from '@/components/tables/laravel-table';
import { appendQueryString } from '@/lib/utils';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { useCallback, useContext, useMemo } from 'react';
import { DetailContext, DetailItem } from '../../detail';

export function DetailTable() {
    const { detailsPagination: pagination } = useContext(DetailContext);

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
                dataIndex: 'approved_qty',
                key: 'approved_qty',
            },
            {
                title: 'Note',
                dataIndex: 'note',
                key: 'note',
            },
        ],
        [pagination],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <>
            {/* <Space direction="vertical" className="w-full"> */}
            <LaravelTable<DetailItem>
                rowKey="id"
                columns={columns}
                onPageChange={handlePageChange}
                pagination={pagination}
                // hidePagination
                // summary={() => (
                //     <>
                //         <Table.Summary.Row>
                //             <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                //             <Table.Summary.Cell index={4}>
                //                 <b>Total Item</b>
                //             </Table.Summary.Cell>
                //             <Table.Summary.Cell index={5}>
                //                 {header?.quantity_item}
                //             </Table.Summary.Cell>
                //             <Table.Summary.Cell index={6}></Table.Summary.Cell>
                //         </Table.Summary.Row>
                //         <Table.Summary.Row>
                //             <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                //             <Table.Summary.Cell index={4}>
                //                 <b>Grand Total</b>
                //             </Table.Summary.Cell>
                //             <Table.Summary.Cell index={5}>
                //                 {header?.grand_total}
                //             </Table.Summary.Cell>
                //             <Table.Summary.Cell index={6}></Table.Summary.Cell>
                //         </Table.Summary.Row>
                //     </>
                // )}
            />
            {/* </Space> */}
        </>
    );
}
