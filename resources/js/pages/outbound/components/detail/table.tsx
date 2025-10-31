import { DeleteButton } from '@/components/buttons/common-buttons';
import CustomTable from '@/components/tables/custom-table';
import { usePermission } from '@/hooks/use-permission';
import { appendQueryString } from '@/lib/utils';
import { OutboundDetailWithRelation } from '@/types/warehouse-outbound.type';
import { router } from '@inertiajs/react';
import { message, Tag, type TableProps } from 'antd';
import { useCallback, useContext, useMemo } from 'react';
import { DetailContext } from '../../detail';

export function DetailTable() {
    const { detailsPagination: pagination } = useContext(DetailContext);
    const { hasPermission } = usePermission();

    const handleDelete = useCallback((id: string) => {
        router.delete(`/outbound/detail/${id}`, {
            onError: () => {
                message.error('Delete Detail Gagal');
            },
            onSuccess: () => {
                message.success('Delete Detail Success');
            },
            // onStart: () => {
            //     setProcessing(true);
            // },
        });
    }, []);

    const columns = useMemo(
        (): TableProps<OutboundDetailWithRelation>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: OutboundDetailWithRelation, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            { title: 'Product', dataIndex: ['item', 'product', 'name'], key: 'product.name' },
            {
                title: 'RFID Tag',
                dataIndex: ['item', 'rfid_tag', 'value'],
                key: 'qty',
                render: (rfid) => <Tag color="blue">{rfid}</Tag>,
            },
            ...(hasPermission('outbound.delete')
                ? [
                      {
                          title: 'Action',
                          dataIndex: 'id',
                          key: 'action',
                          render: (v) => (
                              <DeleteButton onClick={() => handleDelete(v)} disabled={false} />
                          ),
                      },
                  ]
                : []),
        ],
        [handleDelete, hasPermission, pagination],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <>
            <CustomTable<OutboundDetailWithRelation>
                rowKey="id"
                columns={columns}
                dataSource={pagination?.data}
                onPaginationChange={handlePageChange}
                page={pagination?.current_page || 1}
            />
        </>
    );
}
