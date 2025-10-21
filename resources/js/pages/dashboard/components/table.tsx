import { DateTimeDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { Storage } from '@/types/storage.type';
import { EnvironmentOutlined, QrcodeOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Card, TableProps, Tag } from 'antd';
import { useCallback, useMemo } from 'react';

interface Props {
    pagination: SimplePagination<Storage> | null;
}
export default function TableLocation({ pagination }: Props) {
    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    const columns = useMemo(
        (): TableProps<Storage>['columns'] => [
            {
                title: 'Code',
                dataIndex: 'product_code',
                key: 'product_code',
                render: (text) => (
                    <Tag icon={<QrcodeOutlined />} color="blue">
                        {text}
                    </Tag>
                ),
            },
            {
                title: 'Product',
                dataIndex: 'product_name',
                key: 'product_name',
            },
            {
                title: 'Location',
                dataIndex: 'location',
                key: 'location',
                render: (_, record: Storage) => {
                    const parts: string[] = [];
                    // if (record?.warehouse_name) parts.push(record?.warehouse_name);
                    if (record?.room_name) parts.push(record?.room_name);
                    if (record?.rack_name) parts.push(record?.rack_name);
                    if (record?.layer_name) parts.push(record?.layer_name);

                    return (
                        <Tag icon={<EnvironmentOutlined />} color="green">
                            {parts.join(' 🔷 ')}
                        </Tag>
                    );
                },
            },
            {
                title: 'Last Seen',
                dataIndex: 'last_seen',
                key: 'last_seen',
                render: (val) => <DateTimeDisplay val={val} />,
            },
        ],
        [],
    );

    return (
        <Card>
            <Card.Meta title="Current Product Locations" />
            <CustomTable<Storage>
                columns={columns}
                size="small"
                dataSource={pagination?.data}
                rowKey={(record, i) => `${record.product_id}-${i}`}
                onPaginationChange={handlePageChange}
                page={pagination?.current_page || 1}
                paginationSize="small"
            />
        </Card>
    );
}
