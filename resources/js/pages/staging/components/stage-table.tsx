import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { StagingWithDetailRelations } from '@/types/warehouse-staging.type';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, Card, List, Popover, Space, Table, TableProps, Tag, Typography } from 'antd';
import { Edit, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

const groupDetailsByProduct = (details) => {
    const groupedMap = new Map();

    details.forEach((item) => {
        const { product_id, rfid_tag_id, product } = item;

        if (groupedMap.has(product_id)) {
            // Jika product_id sudah ada di Map, tambahkan tag baru
            const existingGroup = groupedMap.get(product_id);
            existingGroup.qty += 1;
            existingGroup.rfid_tags.push(rfid_tag_id);
        } else {
            // Jika product_id belum ada, buat entri baru
            groupedMap.set(product_id, {
                key: product_id,
                product_id: product_id,
                product,
                qty: 1,
                rfid_tags: [rfid_tag_id],
            });
        }
    });

    // Mengubah nilai dari Map kembali menjadi Array
    return Array.from(groupedMap.values());
};

const { Text } = Typography;

// Function untuk merender baris yang diperluas
const expandedRowRender = (record) => {
    // Mengelompokkan detail berdasarkan product_id untuk tampilan ringkas
    const groupedDetails = groupDetailsByProduct(record.detail);

    const detailColumns = [
        { title: 'Product', dataIndex: ['product', 'name'], key: 'product.name' },
        {
            title: 'Quantity Tag',
            dataIndex: 'qty',
            key: 'qty',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Lihat Tags',
            key: 'tags',
            render: (_, item) => (
                <Popover
                    content={
                        <List
                            size="small"
                            dataSource={item.rfid_tags}
                            renderItem={(tag: string) => <List.Item>{tag}</List.Item>}
                        />
                    }
                >
                    <Button size="small">Detail Tags ({item.rfid_tags.length})</Button>
                </Popover>
            ),
        },
    ];

    return (
        <Table<StagingWithDetailRelations>
            columns={detailColumns}
            dataSource={groupedDetails}
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
    const handleEdit = useCallback((id: string) => {
        router.get('/staging/manual-input?header=' + id);
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
                title: 'Action',
                dataIndex: 'id',
                key: 'id',
                render: (val) => (
                    <Space size={20} align="end" className="w-full">
                        <Button
                            type="primary"
                            onClick={() => handleEdit(val)}
                            icon={<Edit size={18} />}
                        />
                        <Button type="dashed" danger icon={<Trash2 size={18} />} />
                    </Space>
                ),
            },
        ],
        [handleEdit],
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
