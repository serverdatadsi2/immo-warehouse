import { ItemCondition } from '@/types/item-condition.type';
import { Button, Card, Col, Input, Row, Space } from 'antd';
import { useState } from 'react';
const { Meta } = Card;

interface Props {
    setCondition: React.Dispatch<React.SetStateAction<ItemCondition | undefined>>;
    setScanning: React.Dispatch<React.SetStateAction<boolean>>;
    scanning: boolean;
}
export function LeftPannel({ setCondition, scanning, setScanning }: Props) {
    const [label, setLabel] = useState<ItemCondition>();
    const [manualLabel, setManualLabel] = useState<ItemCondition>();

    const handleAutoLabel = (v: ItemCondition) => {
        setManualLabel(undefined);
        setLabel(v);
        setCondition(v);
    };
    const handleManualLabel = (v: ItemCondition) => {
        setManualLabel(v);
        setLabel(undefined);
        setCondition(v);
    };
    return (
        <>
            <Space direction="vertical" size="large" className="w-full">
                <Card
                    actions={[
                        <div className="mx-10">
                            <Button
                                type="primary"
                                className="w-full !font-bold"
                                danger={scanning}
                                onClick={() => setScanning((s) => !s)}
                                disabled={!label}
                            >
                                {scanning ? 'Stop Scan' : 'Start Scan'}
                            </Button>
                        </div>,
                    ]}
                >
                    <Meta
                        title="RFID Labeling Mode"
                        description="Silahkan Memilih label terlebih dahulu sebelum melakukan scan RFID"
                    />
                    <Row gutter={12} className="mt-8">
                        <Col span={10}>
                            <Button
                                className="w-full !font-bold"
                                type={label?.name === 'bad' ? 'primary' : 'default'}
                                danger
                                onClick={() =>
                                    handleAutoLabel({
                                        id: 'f3cbe4b8-2e6f-4b9a-95a4-2a1f0f3c8e5d',
                                        name: 'bad',
                                    })
                                }
                                disabled={scanning && label?.name === 'good'}
                            >
                                Bad
                            </Button>
                        </Col>
                        <Col span={4}></Col>
                        <Col span={10}>
                            <Button
                                className="w-full !font-bold"
                                type={label?.name === 'good' ? 'primary' : 'default'}
                                onClick={() =>
                                    handleAutoLabel({
                                        id: 'c4e5d2a3-68c2-4d9a-81a6-431b9c4e3d7f',
                                        name: 'good',
                                    })
                                }
                                disabled={scanning && label?.name === 'bad'}
                            >
                                Good
                            </Button>
                        </Col>
                    </Row>
                </Card>

                <Card
                    actions={[
                        <Row gutter={10} className="px-2">
                            <Col span={3}>
                                <Button
                                    type={manualLabel?.name === 'bad' ? 'primary' : 'default'}
                                    danger
                                    onClick={() =>
                                        handleManualLabel({
                                            id: 'f3cbe4b8-2e6f-4b9a-95a4-2a1f0f3c8e5d',
                                            name: 'bad',
                                        })
                                    }
                                    disabled={scanning}
                                >
                                    Bad
                                </Button>
                            </Col>
                            <Col span={3}>
                                <Button
                                    type={manualLabel?.name === 'good' ? 'primary' : 'default'}
                                    onClick={() =>
                                        handleManualLabel({
                                            id: 'c4e5d2a3-68c2-4d9a-81a6-431b9c4e3d7f',
                                            name: 'good',
                                        })
                                    }
                                    disabled={scanning}
                                >
                                    good
                                </Button>
                            </Col>
                            <Col span={18}>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Pilih labeling dulu lalu masukkan RFID dan submit"
                                        disabled={scanning}
                                    />
                                    <Button type="primary" disabled={scanning || !manualLabel}>
                                        Submit
                                    </Button>
                                </Space.Compact>
                            </Col>
                        </Row>,
                    ]}
                >
                    <Meta
                        title="RFID Manual Input"
                        description="Silahkan Memilih label terlebih dahulu sebelum melakukan input RFID"
                    />
                </Card>
            </Space>
        </>
    );
}
