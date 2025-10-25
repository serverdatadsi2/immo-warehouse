import { DateDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { usePermission } from '@/hooks/use-permission';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { StagingWithDetailRelations } from '@/types/warehouse-staging.type';
import { DownOutlined, RightOutlined, TruckOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import {
    Button,
    Card,
    message,
    Popconfirm,
    Space,
    Table,
    TableProps,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import { Edit, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

const { Text } = Typography;

// Function untuk merender baris yang diperluas
const expandedRowRender = (record) => {
    const detailColumns = [
        {
            title: 'No.',
            key: 'index',
            render: (_: any, __, index: number) => index + 1,
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
    ];

    return (
        <Table<StagingWithDetailRelations>
            columns={detailColumns}
            dataSource={record.detail}
            pagination={false}
            size="small"
            title={() => <Text strong>Detail Staging</Text>}
        />
    );
};

// Penggunaan di komponen utama

interface Props {
    pagination: SimplePagination<StagingWithDetailRelations>;
}
export default function StagingTable({ pagination }: Props) {
    const { hasPermission } = usePermission();
    const handleEdit = useCallback((id: string) => {
        router.get('/staging/manual-input?header=' + id);
    }, []);

    const handleDelete = useCallback((id: string) => {
        router.delete(`/staging/manual-input/${id}`, {
            onError: () => {
                message.error('Delete Staging Area Gagal');
            },
            onSuccess: () => {
                message.success('Delete Staging Area Success');
            },
            // onStart: () => {
            //     setProcessing(true);
            // },
        });
    }, []);

    const handleRelease = useCallback((id: string) => {
        router.put(
            `/staging/release/${id}`,
            {},
            {
                onError: () => {
                    message.error('Release Staging Area Gagal');
                },
                onSuccess: () => {
                    message.success('Release Staging Area Success');
                },
                // onStart: () => {
                //     setProcessing(true);
                // },
            },
        );
    }, []);

    const columns = useMemo(
        (): TableProps<StagingWithDetailRelations>['columns'] => [
            { title: 'Warehouse', dataIndex: ['warehouse', 'name'], key: 'warehouse_id' },
            {
                title: 'Staging',
                dataIndex: 'name',
                key: 'name',
            },
            // {
            //     title: 'Reader ID',
            //     dataIndex: 'rfid_reader_id',
            //     key: 'rfid_reader_id',
            // },

            // {
            //     title: 'Status',
            //     dataIndex: 'status',
            //     key: 'status',
            // },
            {
                title: 'Grand Total',
                dataIndex: 'quantity',
                key: 'quantity',
                render: (text) => <Tag color="blue">{text}</Tag>,
            },
            {
                title: 'Release At',
                dataIndex: 'released_at',
                key: 'release_at',
                render: (v) => <DateDisplay val={v} />,
            },
            {
                title: 'Action',
                dataIndex: 'id',
                key: 'id',
                render: (val, record) =>
                    record?.released_at ? null : (
                        <Space size={20} align="end" className="w-full">
                            {hasPermission('staging.update') && (
                                <Tooltip title="Edit detail staging area">
                                    <Button
                                        type="primary"
                                        onClick={() => handleEdit(val)}
                                        icon={<Edit size={18} />}
                                    />
                                </Tooltip>
                            )}
                            {hasPermission('staging.kirim')}
                            <Tooltip title="Dimuat">
                                <Button icon={<TruckOutlined />} onClick={() => handleRelease(val)}>
                                    Kirim
                                </Button>
                            </Tooltip>
                            {hasPermission('staging.delete') && (
                                <Tooltip title="delete staging area">
                                    <Popconfirm
                                        title="Delete"
                                        description="Are you sure to delete this Data?"
                                        onConfirm={() => handleDelete(val)}
                                    >
                                        <Button type="dashed" danger icon={<Trash2 size={18} />} />
                                    </Popconfirm>
                                </Tooltip>
                            )}
                        </Space>
                    ),
            },
        ],
        [handleDelete, handleEdit, handleRelease, hasPermission],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <Card
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <CustomTable<StagingWithDetailRelations>
                size="small"
                expandable={{
                    expandedRowRender,
                    expandIcon: ({ expanded, onExpand, record }) =>
                        expanded ? (
                            <DownOutlined onClick={(e) => onExpand(record, e)} />
                        ) : (
                            <RightOutlined onClick={(e) => onExpand(record, e)} />
                        ),
                }}
                columns={columns}
                dataSource={pagination?.data}
                onPaginationChange={handlePageChange}
                page={pagination.current_page || 1}
                bordered
                rowKey="id"
            />
        </Card>
    );
}
