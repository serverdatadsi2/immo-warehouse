import { useSystemMessage } from '@/components/messages/message-provider';
import { router } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, List, message, Typography } from 'antd';
import { useCallback, useState } from 'react';
import { useRfidTagging } from '../context';
const { Text } = Typography;
const { Meta } = Card;

export function RightPannel() {
    const { scanning, selected, data, setData } = useRfidTagging();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const showMessge = useSystemMessage();
    const queryClient = useQueryClient();

    const handleUpdateStock = useCallback(() => {
        setLoading(true);
        router.post(
            '/rfid-tagging',
            {
                warehouse_id: selected?.warehouse_id,
                rfid_tags: data?.map((d) => d.rfid_tag_id),
            },
            {
                onSuccess: () => {
                    setData([]);
                    showMessge({ action: 'save', model: 'RFID Tagging', status: 'success' });
                    queryClient.invalidateQueries({ queryKey: ['inbound-detail-list'] }); //refetch
                },
                onError: (e) => {
                    message.destroy();
                    showMessge({ action: 'save', model: 'RFID Tagging', status: 'error' });
                    // eslint-disable-next-line no-console
                    console.error('error update stock', e);
                },
                onFinish: () => {
                    setLoading(false);
                    message.destroy();
                },
                onStart: () => {
                    setLoading(true);
                    message.loading('Loading...', 0);
                },
            },
        );
    }, [selected, data, setData, showMessge, queryClient]);

    return (
        <Card
            size="small"
            actions={[
                <Button
                    danger
                    disabled={scanning || !selected || !data}
                    onClick={() => setData(undefined)}
                >
                    Clear All
                </Button>,
                <Button
                    type="primary"
                    disabled={scanning || !selected || loading || !data}
                    onClick={handleUpdateStock}
                >
                    Save Assignments
                </Button>,
            ]}
        >
            <Meta
                style={{
                    cursor: 'pointer',
                    backgroundColor: selected ? '#bae0ff' : '',
                    borderRadius: 4,
                    margin: '-12px -12px 0 -12px',
                    padding: 10,
                }}
                title="Assignment"
                description={selected ? `${selected.product_code} — ${selected.product_name}` : ''}
            />
            <List
                size="small"
                pagination={{
                    size: 'small',
                    showSizeChanger: false,
                    align: 'center',
                    pageSize: 10,
                    onChange: (page) => setCurrentPage(page),
                }}
                dataSource={data}
                // locale={{ emptyText: 'Belum ada RFID terdeteksi' }}
                renderItem={(v, i) => (
                    <List.Item>
                        <List.Item.Meta
                            title={
                                <div className="flex gap-x-2">
                                    <Text>{(currentPage - 1) * 10 + (i + 1) + '.'}</Text>
                                    <Text>RFID : {v.rfid_tag_id}</Text>
                                    {/* <Button onClick={() => handleClick(v)} size="small">
                                        Detail Item
                                    </Button> */}
                                </div>
                            }
                            // description={v}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}
