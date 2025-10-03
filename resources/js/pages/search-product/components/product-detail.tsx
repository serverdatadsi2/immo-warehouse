import { ProductStock } from '@/types/location-stock.type';
import { Card, Divider, Space, Tag, Typography } from 'antd';

interface Props {
    data: ProductStock;
}

const { Text } = Typography;
export default function BarangDetailOverviewCard({ data }: Props) {
    return (
        <Card className="text-center">
            <Card.Meta title="Detail Barang" description="Informasi Lokasi Detail Barang" />
            <div className="grid grid-cols-1 mb-10 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4 sm:px-8 md:px-20 mt-8">
                <Space direction="vertical" size={20}>
                    <Text strong>Nama Barang</Text>
                    <Text>{data.product_name}</Text>
                </Space>
                <Space direction="vertical" size={20}>
                    <Text strong>Kode Barang</Text>
                    <Text>{data.product_code}</Text>
                </Space>
                <Space direction="vertical" size={20}>
                    <Text strong>Total Stok Tersedia</Text>
                    <Text strong style={{ color: 'green' }}>
                        {`${data.grand_total} ${data.product_unit}`}
                    </Text>
                </Space>
            </div>
            {/* <div className="grid grid-cols-2 px-20 gap-3 mt-10">
                <Text strong>Supplier</Text>
                <Text strong>Total Stok Tersedia</Text>
                <Text>{data.nama_supplier}</Text>
                <Text strong style={{ color: 'green' }}>
                    {`${data.grand_total} ${data.product_unit}`}
                </Text>
            </div> */}

            {/* Daftar Lokasi */}
            <Divider>Lokasi Stok</Divider>

            {data?.locations?.map((item, index) => (
                <Card
                    key={index}
                    style={{ marginBottom: 25, background: '#fff1b8', padding: '0 20px 0 20px' }}
                >
                    <div className="flex justify-between mb-5">
                        <h4 style={{ fontWeight: 600, color: '#444' }}>Lokasi {index + 1}</h4>
                        <Tag color="green" className="font-semibold">
                            Stok: {item.quantity}
                        </Tag>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 px-4 sm:px-6 md:px-10 mt-6">
                        <Space direction="vertical" size={4}>
                            <Text strong>Warehouse</Text>
                            <Text>
                                {item.warehouse_name} ({item.warehouse_code})
                            </Text>
                        </Space>

                        <Space direction="vertical" size={4}>
                            <Text strong>Rak</Text>
                            <Text>
                                {item.rack_name} ({item.rack_code})
                            </Text>
                        </Space>

                        <Space direction="vertical" size={4}>
                            <Text strong>Ruangan</Text>
                            <Text>
                                {item.room_name} ({item.room_code})
                            </Text>
                        </Space>

                        <Space direction="vertical" size={4}>
                            <Text strong>Layer Rak</Text>
                            <Text>
                                {item.layer_name} ({item.layer_code})
                            </Text>
                        </Space>
                    </div>

                    {/* Tanggal Kadaluarsa */}
                    {/* {item.tanggal_kadaluarsa && (
                        <div style={{ marginTop: 12 }}>
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Tanggal Kadaluarsa">
                                    {new Date(item.tanggal_kadaluarsa).toLocaleDateString(
                                        'id-ID',
                                        {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        },
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    )} */}
                </Card>
            ))}

            {/* Summary */}
            <div style={{ marginTop: 24, padding: 16, background: '#e6f4ff', borderRadius: 8 }}>
                <h4 style={{ fontWeight: 600, color: '#0958d9', marginBottom: 8 }}>Summary</h4>
                <p style={{ fontSize: 14, color: '#1677ff' }}>
                    Barang <strong>{data.product_name}</strong> tersedia di{' '}
                    <strong>{data?.locations?.length} lokasi</strong> dengan total stok{' '}
                    <strong> {`${data.grand_total} ${data.product_name}`}</strong>.
                </p>
            </div>
        </Card>
    );
}
