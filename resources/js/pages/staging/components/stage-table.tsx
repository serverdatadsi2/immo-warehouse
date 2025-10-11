import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, List, Popover, Table, Tag, Typography } from 'antd';
// Data yang dikirim dari Backend Laravel
const data = [
    {
        key: '1',
        warehouse_staging_outbound_id: 'STG-2025001', // Header
        warehouse_id: 'WH-JKT', // Header
        quantity: 450, // Header
        name: 'Budi Santoso', // Header
        rfid_reader_id: 'RDR-005', // Header
        status: 'Selesai',
        details: [
            { product_id: 'SHIRT-RED-L', item_id: 'ITM-101', rfid_tag_id: 'E280113...' },
            { product_id: 'SHIRT-RED-L', item_id: 'ITM-102', rfid_tag_id: 'E280114...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
            { product_id: 'PANT-BLUE-M', item_id: 'ITM-201', rfid_tag_id: 'E280115...' },
        ],
    },
];

const groupDetailsByProduct = (details) => {
    // 1. Menggunakan Map untuk mengelompokkan data
    const groupedMap = new Map();

    details.forEach((item) => {
        const { product_id, rfid_tag_id, item_id } = item;

        if (groupedMap.has(product_id)) {
            // Jika product_id sudah ada di Map, tambahkan tag baru
            const existingGroup = groupedMap.get(product_id);
            existingGroup.qty += 1;
            existingGroup.rfid_tags.push(rfid_tag_id);

            // (Opsional) Tambahkan item_id jika perlu
            if (item_id) {
                existingGroup.item_ids.push(item_id);
            }
        } else {
            // Jika product_id belum ada, buat entri baru
            groupedMap.set(product_id, {
                // Kunci unik untuk AntD Table
                key: product_id,
                // Data Utama
                product_id: product_id,
                qty: 1,
                // List detail
                rfid_tags: [rfid_tag_id],
                item_ids: item_id ? [item_id] : [], // Opsional
            });
        }
    });

    // 2. Mengubah nilai dari Map kembali menjadi Array
    return Array.from(groupedMap.values());
};

const { Text } = Typography;

// Function untuk merender baris yang diperluas
const expandedRowRender = (record) => {
    // Mengelompokkan detail berdasarkan product_id untuk tampilan ringkas
    const groupedDetails = groupDetailsByProduct(record.details);

    const detailColumns = [
        { title: 'Product', dataIndex: 'product_id', key: 'pid' },
        {
            title: 'Quantity Tag',
            dataIndex: 'qty',
            key: 'qty',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Lihat Tags',
            key: 'tags',
            render: (text, item) => (
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
        <Table
            columns={detailColumns}
            dataSource={groupedDetails}
            pagination={false}
            size="small"
            title={() => <Text strong>Detail Item Staging</Text>}
        />
    );
};

// Penggunaan di komponen utama
export default function StagingTable() {
    const headerColumns = [
        { title: 'Warehouse', dataIndex: 'warehouse_id', key: 'pid' },
        {
            title: 'Staging ID',
            dataIndex: 'warehouse_staging_outbound_id',
            key: 'warehouse_staging_outbound_id',
        },
        {
            title: 'Reader ID',
            dataIndex: 'rfid_reader_id',
            key: 'rfid_reader_id',
        },

        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Grand Total',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
    ];

    return (
        <Card
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <Table
                bordered
                size="small"
                columns={headerColumns}
                expandable={{
                    expandedRowRender,
                    expandIcon: ({ expanded, onExpand, record }) =>
                        expanded ? (
                            <DownOutlined onClick={(e) => onExpand(record, e)} />
                        ) : (
                            <RightOutlined onClick={(e) => onExpand(record, e)} />
                        ),
                }}
                dataSource={data}
                pagination={{ pageSize: 10 }}
            />
        </Card>
    );
}
