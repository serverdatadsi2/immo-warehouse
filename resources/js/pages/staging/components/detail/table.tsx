import { DeleteButton } from '@/components/buttons/common-buttons';
import CustomTable from '@/components/tables/custom-table';
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
            { title: 'Product', dataIndex: ['product', 'name'], key: 'product.name' },
            {
                title: 'RFID Tag',
                dataIndex: ['rfid', 'value'],
                key: 'qty',
                render: (rfid) => <Tag color="blue">{rfid}</Tag>,
            },
            {
                title: 'Action',
                dataIndex: 'id',
                key: 'action',
                render: (v) => <DeleteButton onClick={() => handleDelete(v)} disabled={false} />,
            },
        ],
        [handleDelete],
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
