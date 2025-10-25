import { DeleteButton } from '@/components/buttons/common-buttons';
import CustomTable from '@/components/tables/custom-table';
import { usePermission } from '@/hooks/use-permission';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { StagingDetailWithRelation } from '@/types/warehouse-staging.type';
import { router } from '@inertiajs/react';
import { message, Tag, type TableProps } from 'antd';
import { useCallback, useMemo } from 'react';

interface Props {
    pagination: SimplePagination<StagingDetailWithRelation>;
}

export function DetailTable({ pagination }: Props) {
    const { hasPermission } = usePermission();
    const handleDelete = useCallback((id: string) => {
        router.delete(`/staging/manual-input/detail/${id}`, {
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
        (): TableProps<StagingDetailWithRelation>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: StagingDetailWithRelation, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Surat jalan',
                dataIndex: ['outbound', 'delivery_order_number'],
                key: 'delivery_order_number',
            },
            {
                title: 'Pengiriman',
                dataIndex: ['outbound', 'courier', 'name'],
                key: 'qty',
                render: (rfid) => <Tag color="blue">{rfid}</Tag>,
            },
            {
                title: 'Order',
                children: [
                    {
                        title: 'Type',
                        dataIndex: ['outbound', 'order_ref'],
                        key: 'order_ref',
                        align: 'center',
                    },
                    {
                        title: 'Number',
                        dataIndex: ['outbound', 'order_number'],
                        key: 'order_number',
                        align: 'center',
                    },
                ],
            },
            ...(hasPermission('staging.delete')
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
        [handleDelete, pagination, hasPermission],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <>
            <CustomTable<StagingDetailWithRelation>
                rowKey="id"
                columns={columns}
                dataSource={pagination.data}
                onPaginationChange={handlePageChange}
                page={pagination.current_page || 1}
            />
        </>
    );
}
