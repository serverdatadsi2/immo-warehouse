import { AddButton } from '@/components/buttons/crud-buttons';
import { LaravelTable } from '@/components/tables/laravel-table';
import { appendQueryString } from '@/lib/utils';
import { Storage } from '@/types/storage.type';
import { router } from '@inertiajs/react';
import { TableProps } from 'antd';
import { useCallback, useMemo } from 'react';
import { data } from './data';

// interface Props {
//     pagination: LaravelPagination<Storage> | null;
// }
const pagination = data;

export default function TableData() {
    const handleAdd = useCallback(() => {
        router.get('/storage-warehouse/assignment');
    }, []);

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    const columns = useMemo(
        (): TableProps<Storage>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: Storage, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Nama Barang',
                dataIndex: 'product_name',
                key: 'product',
            },
            {
                title: 'Code',
                dataIndex: 'product_code',
                key: 'product_code',
            },
            {
                title: 'Location',
                key: 'location',
                dataIndex: 'location',
                // render: (record: Storage) => {
                //     const parts: string[] = [];
                //     if (record.room_name) parts.push(record?.room_name);
                //     if (record.rack_name) parts.push(record?.rack_name);
                //     if (record.layer_name) parts.push(record?.layer_name);

                //     return parts.join(' > ');
                // },
            },
            {
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
            },
            {
                title: 'Kapasitas',
                dataIndex: 'quantity',
                key: 'quantity',
            },
        ],
        [],
    );

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <AddButton onClick={handleAdd}>Assignment Item</AddButton>
            </div>

            <LaravelTable<Storage>
                columns={columns}
                dataSource={pagination?.data}
                rowKey="id"
                pagination={pagination}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
