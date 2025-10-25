import { DateDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { usePermission } from '@/hooks/use-permission';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { ReturnStoreWithRelation } from '@/types/return-store.type';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Space, Tag, Tooltip } from 'antd';
import { HandCoins } from 'lucide-react';
import { useCallback, useMemo } from 'react';

export function HeaderTable({ pagination }: Props) {
    const { hasPermission } = usePermission();
    const handleAction = useCallback((val: ReturnStoreWithRelation) => {
        router.get(`/inbounds/return-store/detail?storeReturnId=${val.id}`);
    }, []);

    const columns = useMemo(
        (): TableProps<ReturnStoreWithRelation>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: ReturnStoreWithRelation, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Store',
                dataIndex: ['store', 'name'],
                key: 'supplier_name',
                align: 'center',
            },

            {
                title: 'Nomor Retur',
                dataIndex: 'return_number',
                key: 'return_number',
                align: 'center',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                align: 'center',
                render: (qty) => (
                    <Tag color="blue" style={{ fontWeight: 'bold' }}>
                        {qty}
                    </Tag>
                ),
            },
            {
                title: 'Store Note',
                dataIndex: 'note_store',
                key: 'note_store',
                align: 'center',
            },

            {
                title: 'Return Approved',
                children: [
                    {
                        title: 'Tanggal',
                        dataIndex: 'approved_at',
                        key: 'approved_at',
                        align: 'center',
                        render: (v) => <DateDisplay val={v} />,
                    },
                    {
                        title: 'Nama',
                        dataIndex: ['approved', 'name'],
                        key: 'approved_name',
                        align: 'center',
                    },
                    {
                        title: 'Tanggal Dikirm',
                        dataIndex: 'shipped_at',
                        key: 'shipped_at',
                        align: 'center',
                        render: (v) => <DateDisplay val={v} />,
                    },
                ],
            },
            {
                title: 'Aksi',
                key: 'action',
                fixed: 'right',
                align: 'center',
                render: (_, d) =>
                    hasPermission('inbound.return.write') && (
                        <Tooltip title="Terima">
                            <Button
                                onClick={() => handleAction(d)}
                                icon={<HandCoins />}
                                type="primary"
                                style={{ borderRadius: 8, backgroundColor: '#73d13d' }}
                            />
                        </Tooltip>
                    ),
            },
        ],
        [handleAction, pagination, hasPermission],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <Space direction="vertical" className="w-full">
            <CustomTable<ReturnStoreWithRelation>
                size="small"
                rowKey="id"
                columns={columns}
                bordered
                dataSource={pagination?.data}
                onPaginationChange={handlePageChange}
                page={pagination?.current_page || 1}
                pagination={false}
                className="max-w-full"
                scroll={{ x: 'max-content' }}
            />
        </Space>
    );
}

type Props = {
    pagination: SimplePagination<ReturnStoreWithRelation> | undefined;
};
