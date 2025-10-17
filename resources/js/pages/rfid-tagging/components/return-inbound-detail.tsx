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
import QRCodePrinter from './print-qrcode-backend';
const { Meta } = Card;

export function ReturnInboundDetail() {
    const { selected, setSelected, setData } = useRfidTagging();
    // const { scanning, setScanning, selected, setSelected, setData } = useRfidTagging();
    // const showMessge = useSystemMessage();
    const [search, setSearch] = useState<string>();
    const [page, setPage] = useState<string>();

    const { data: pagination, isLoading } = useQuery({
        queryKey: ['return-inbound-detail-list', search, page],
        queryFn: async () => {
            const res = await axiosIns.get<LaravelPagination<InboundDetailWithRelation>>(
                '/rfid-tagging/return-inbound-detail-list',
                {
                    params: { search, page },
                },
            );
            return res.data;
        },
    });

    // const { mutate } = useMutation({
    //     mutationFn: (payload: GetItems) =>
    //         axiosIns.post<Item[]>('/items/by-inbound-details', payload),
    //     onSuccess: (res) => {
    //         if (res.data) setData(res.data);
    //         showMessge({ action: 'save', model: 'RFID Tag', status: 'success' });
    //         message.destroy();
    //         setScanning(false);
    //     },
    //     onError: () => {
    //         showMessge({ action: 'save', model: 'RFID Tag', status: 'error' });
    //         setScanning(false);
    //     },
    // });

    const handleSelect = useCallback(
        (v: InboundDetailWithRelation) => {
            setSelected(v);
            setData(undefined);
        },
        [setData, setSelected],
    );

    // const handleScan = useCallback(
    //     (v: boolean) => {
    //         setScanning(v);
    //         message.loading('Loading...');

    //         if (v && selected && selected.quantity > 0) {
    //             mutate({
    //                 warehouse_inbound_detail_id: selected?.id,
    //                 product_id: selected?.product_id,
    //                 expired_date: selected?.expired_date,
    //             });
    //         }
    //     },
    //     [mutate, selected, setScanning],
    // );

    const debounce = useDebounce((val: string) => {
        setSearch(val);
    }, 300);

    return (
        <>
            {/* <Space direction="vertical" size="large" className="w-full"> */}
            <Card
                style={{
                    background: '#fff7e6',
                    boxShadow: '0 2px 8px #fffbe6',
                }}
                // actions={[
                //     <div className="mx-10">
                //         <Button
                //             type="primary"
                //             className="w-full !font-bold"
                //             danger={scanning}
                //             onClick={() => handleScan(!scanning)}
                //             // disabled={!selected}
                //             disabled
                //         >
                //             {scanning ? 'Stop Scan' : 'Start Scan'}
                //             {/* Tagging */}
                //         </Button>
                //     </div>,
                // ]}
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
                                    <QRCodePrinter selectInbound={item} />
                                    {/* <PrintButton onClick={() => console.log('test')} /> */}
                                </List.Item>
                            );
                        }}
                    />
                </Space>
            </Card>

            {/* <Card
                    actions={[
                        <Space.Compact style={{ width: '90%' }}>
                            <Input
                                placeholder="Input RFID manual"
                                disabled
                                // disabled={scanning || !selected}
                            />
                            <Button
                                type="primary"
                                disabled
                                // disabled={scanning || !selected}
                            >
                                Add
                            </Button>
                        </Space.Compact>,
                    ]}
                >
                    <Meta
                        title="Manual Tag / Quick Add"
                        description="Pilih inbound detail terlebih dahulu sebelum melakukan Manual Tag"
                    />
                </Card> */}
            {/* </Space> */}
        </>
    );
}
