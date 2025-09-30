import { ItemCondition } from '@/types/item-condition.type';
import { Button, Card, List, message, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { rfid } from './data';
const { Text } = Typography;
const rfidData = rfid;

interface Props {
    condition: ItemCondition | undefined;
    scanning: boolean;
}
export function RightPannel({ condition, scanning }: Props) {
    const [data, setData] = useState<string[]>();
    const handleClick = useCallback((v: string) => {
        message.info(`Fetch Api for RFID (${v}) detail item`);
    }, []);

    useEffect(() => {
        if (scanning) setData(rfidData);
    }, [scanning]);

    return (
        <Card
            styles={{
                header: {
                    backgroundColor: condition?.name === 'bad' ? '##ff7875' : '#bae0ff',
                },
            }}
            title={<span>{`${condition?.name ?? ''} Label for Items (${data?.length ?? 0})`}</span>}
            type="inner"
        >
            <List
                pagination={{
                    showSizeChanger: false,
                    align: 'center',
                    pageSize: 10,
                }}
                dataSource={data}
                locale={{ emptyText: 'Belum ada RFID terdeteksi' }}
                renderItem={(v) => (
                    <List.Item>
                        <List.Item.Meta
                            title={
                                <div className="flex justify-between">
                                    <Text>RFID : {v}</Text>
                                    <Button onClick={() => handleClick(v)} size="small">
                                        Detail Item
                                    </Button>
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
