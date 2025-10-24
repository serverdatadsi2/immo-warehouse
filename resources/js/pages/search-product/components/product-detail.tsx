import { ProductStock } from '@/types/location-stock.type';
import {
    AppstoreOutlined,
    BarsOutlined,
    EnvironmentOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import { Card, Divider, Empty, Space, Tag, Typography } from 'antd';
import { Warehouse } from 'lucide-react';

interface Props {
    data: ProductStock;
}

const { Text, Title } = Typography;

export default function BarangDetailOverviewCard({ data }: Props) {
    return data.product_name ? (
        <Card
            className="w-full"
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            {/* ================= HEADER ================= */}
            <div className="text-center mb-6">
                <Title level={4} className="!mb-1">
                    Detail Barang
                </Title>
                <Text type="secondary" className="text-xs sm:text-sm">
                    Informasi kondisi dan lokasi detail stok barang
                </Text>
            </div>

            {/* ================= PRODUCT INFO ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 px-2 sm:px-4">
                {/* Nama Barang */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Space direction="vertical" size={8} className="w-full">
                        <Text strong className="text-xs sm:text-sm text-gray-500">
                            Nama Barang
                        </Text>
                        <Text className="text-sm sm:text-base font-medium break-words">
                            {data.product_name}
                        </Text>
                    </Space>
                </div>

                {/* Kode Barang */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Space direction="vertical" size={8} className="w-full">
                        <Text strong className="text-xs sm:text-sm text-gray-500">
                            Kode Barang
                        </Text>
                        <Text className="text-sm sm:text-base font-medium">
                            {data.product_code}
                        </Text>
                    </Space>
                </div>

                {/* Total Stok */}
                <div className="bg-white p-4 rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
                    <Space direction="vertical" size={8} className="w-full">
                        <Text strong className="text-xs sm:text-sm text-gray-500">
                            Total Stok Tersedia
                        </Text>
                        <Text strong className="text-sm sm:text-base" style={{ color: '#52c41a' }}>
                            {`${data?.grand_total} ${data?.product_unit}`}
                        </Text>
                    </Space>
                </div>
            </div>

            {/* ================= KONDISI STOK ================= */}
            <Divider className="my-6">
                <Text strong className="text-sm sm:text-base">
                    Detail Stok per Kondisi
                </Text>
            </Divider>

            {data.conditions?.map((condition, cIndex) => (
                <div key={cIndex} className="mb-8">
                    {/* Header Kondisi */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <Title
                            level={5}
                            className={`${condition.status === 'Good' ? '!text-blue-600' : '!text-red-500'} !mb-2 sm:!mb-0 text-sm sm:text-base`}
                        >
                            Kondisi: {condition.status}
                        </Title>
                        <Tag
                            color={
                                condition.status === 'Good'
                                    ? 'green'
                                    : condition.status === 'Bad'
                                      ? 'red'
                                      : 'orange'
                            }
                            className="font-semibold text-xs sm:text-sm"
                        >
                            Total: {condition.quantity} {data.product_unit}
                        </Tag>
                    </div>

                    {/* Lokasi-lokasi dalam kondisi ini */}
                    <div
                        className={`grid grid-cols-1 ${
                            condition.locations?.length > 1 && 'lg:grid-cols-2'
                        } gap-4`}
                    >
                        {condition.locations?.map((item, index) => (
                            <Card
                                key={index}
                                className="w-full"
                                style={{
                                    background:
                                        condition.status === 'Good'
                                            ? '#d9f7be'
                                            : condition.status === 'Bad'
                                              ? '#fff2f0'
                                              : '#fffbe6',
                                }}
                            >
                                {/* Header Lokasi */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <EnvironmentOutlined className="text-base sm:text-lg" />
                                        <Text strong className="text-sm sm:text-base">
                                            Lokasi {index + 1}
                                        </Text>
                                    </div>
                                    <Tag color="blue" className="font-semibold text-xs sm:text-sm">
                                        Stok: {item.quantity}
                                    </Tag>
                                </div>

                                {/* Detail Lokasi */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Warehouse */}
                                    <div className="bg-white bg-opacity-60 p-3 rounded">
                                        <Space direction="vertical" size={4} className="w-full">
                                            <div className="flex items-center gap-2">
                                                <Warehouse className="text-gray-500" size={16} />
                                                <Text
                                                    strong
                                                    className="text-xs sm:text-sm text-gray-600"
                                                >
                                                    Warehouse
                                                </Text>
                                            </div>
                                            <Text className="text-xs sm:text-sm ml-6 break-words">
                                                {item.warehouse_name}
                                            </Text>
                                            <Text type="secondary" className="text-xs ml-6">
                                                ({item.warehouse_code})
                                            </Text>
                                        </Space>
                                    </div>

                                    {/* Ruangan */}
                                    <div className="bg-white bg-opacity-60 p-3 rounded">
                                        <Space direction="vertical" size={4} className="w-full">
                                            <div className="flex items-center gap-2">
                                                <InboxOutlined className="text-gray-500" />
                                                <Text
                                                    strong
                                                    className="text-xs sm:text-sm text-gray-600"
                                                >
                                                    Ruangan
                                                </Text>
                                            </div>
                                            <Text className="text-xs sm:text-sm ml-6 break-words">
                                                {item.room_name}
                                            </Text>
                                            <Text type="secondary" className="text-xs ml-6">
                                                ({item.room_code})
                                            </Text>
                                        </Space>
                                    </div>

                                    {/* Rak */}
                                    <div className="bg-white bg-opacity-60 p-3 rounded">
                                        <Space direction="vertical" size={4} className="w-full">
                                            <div className="flex items-center gap-2">
                                                <AppstoreOutlined className="text-gray-500" />
                                                <Text
                                                    strong
                                                    className="text-xs sm:text-sm text-gray-600"
                                                >
                                                    Rak
                                                </Text>
                                            </div>
                                            <Text className="text-xs sm:text-sm ml-6 break-words">
                                                {item.rack_name}
                                            </Text>
                                            <Text type="secondary" className="text-xs ml-6">
                                                ({item.rack_code})
                                            </Text>
                                        </Space>
                                    </div>

                                    {/* Layer Rak */}
                                    <div className="bg-white bg-opacity-60 p-3 rounded">
                                        <Space direction="vertical" size={4} className="w-full">
                                            <div className="flex items-center gap-2">
                                                <BarsOutlined className="text-gray-500" />
                                                <Text
                                                    strong
                                                    className="text-xs sm:text-sm text-gray-600"
                                                >
                                                    Layer Rak
                                                </Text>
                                            </div>
                                            <Text className="text-xs sm:text-sm ml-6 break-words">
                                                {item.layer_name}
                                            </Text>
                                            <Text type="secondary" className="text-xs ml-6">
                                                ({item.layer_code})
                                            </Text>
                                        </Space>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {/* ================= SUMMARY ================= */}
            <div className="mt-6 p-4 sm:p-6 bg-blue-50 rounded-lg">
                <Title level={5} className="!mb-2 !text-blue-700 text-sm sm:text-base">
                    Summary
                </Title>
                <Text className="text-xs sm:text-sm text-blue-600 leading-relaxed">
                    Barang <strong>{data.product_name}</strong> memiliki total stok{' '}
                    <strong>{`${data.grand_total} ${data.product_unit}`}</strong> yang terbagi dalam{' '}
                    <strong>{data.conditions?.length}</strong> kondisi berbeda (
                    {data.conditions?.map((c) => c.status).join(', ')}).
                </Text>
            </div>
        </Card>
    ) : (
        <Card
            className="w-full text-center"
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <Empty
                description={<Text type="secondary">Tidak ada data barang yang tersedia</Text>}
            />
        </Card>
    );
}
