import { useDebounce } from '@/hooks/use-debounce';
import axiosIns from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { InboundDetailWithRelation } from '@/types/inbound.type';
import { LaravelPagination } from '@/types/laravel-pagination.type';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Input, List, Space } from 'antd';
import { useCallback, useState } from 'react';
import { useRfidTagging } from '../context';
import PrintComponent from './return-print';
const { Meta } = Card;

export function ReturnInboundDetail() {
    const { selected, setSelected, setData } = useRfidTagging();
    const [search, setSearch] = useState<string>();
    const [page, setPage] = useState<string>();

    const { data: pagination, isLoading } = useQuery({
        queryKey: ['return-inbound-detail-list', search, page],
        queryFn: async () => {
            const res = await axiosIns.get<
                LaravelPagination<
                    InboundDetailWithRelation & {
                        store_return_id: string;
                    }
                >
            >('/rfid/tagging/return-inbound-detail-list', {
                params: { search, page },
            });
            return res.data;
        },
    });

    const handleSelect = useCallback(
        (v: InboundDetailWithRelation) => {
            setSelected(v);
            setData(undefined);
        },
        [setData, setSelected],
    );

    const debounce = useDebounce((val: string) => {
        setSearch(val);
    }, 300);

    return (
        <>
            <Card
                style={{
                    background: '#fff7e6',
                    boxShadow: '0 2px 8px #fffbe6',
                }}
            >
                <Meta
                    title="Return Inbound Details"
                    // description="Silahkan Memilih Inbound terlebih dahulu Kemudian Scan RFID"
                />
                <Space direction="vertical" className="w-full mt-5">
                    <Input
                        suffix={<SearchOutlined />}
                        placeholder="Cari kode atau nama..."
                        onChange={(e) => debounce(e.target.value)}
                    />

                    <List
                        loading={isLoading}
                        dataSource={pagination?.data}
                        pagination={{
                            onChange: (page) => {
                                setPage(page.toString());
                            },
                            size: 'small',
                            showSizeChanger: false,
                            current: pagination?.current_page,
                            total: pagination?.total,
                            pageSize: pagination?.per_page,
                            align: 'center',
                        }}
                        renderItem={(item) => {
                            const isSelected = selected?.id === item.id;
                            return (
                                <List.Item
                                    className="p-8 hover:bg-blue-50"
                                    onClick={() => handleSelect(item)}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#e6f7ff' : '',
                                        border: isSelected ? '1px solid #91caff' : '',
                                        borderRadius: 4,
                                        padding: 10,
                                    }}
                                >
                                    <List.Item.Meta
                                        title={`${item.product_code} — ${item.product_name}`}
                                        description={`Quantity: ${item.quantity}  | inbound: ${formatDate(item.received_date)}`}
                                    />
                                    <PrintComponent selectInbound={item} />
                                </List.Item>
                            );
                        }}
                    />
                </Space>
            </Card>
        </>
    );
}
