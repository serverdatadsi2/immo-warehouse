import SelectRangePicker from '@/components/date-picker/range-picker';
import { useDebounce } from '@/hooks/use-debounce';
import { FilterQc } from '@/types/inbound-qc.type';
import { CloseOutlined, HistoryOutlined, QrcodeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Select, Typography } from 'antd';
import { useState } from 'react';

const { Option } = Select;
const { Text } = Typography;

interface Props {
    filters: FilterQc;
    onChange: (key: any, value: any) => void;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setHistory: React.Dispatch<React.SetStateAction<boolean>>;
    history: boolean;
}

export default function Filter({ filters, onChange, setVisible, history, setHistory }: Props) {
    const [search, setSearch] = useState<string>();

    const debounce = useDebounce((val: string) => {
        onChange('search', val);
    }, 300);

    return (
        <Card
            style={{
                marginBottom: 24,
                background: history ? '#bfbfbf' : '#f5faff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <Row gutter={16} align="middle">
                <Col span={6}>
                    <Text strong style={{ color: '#1890ff' }}>
                        📅 Tanggal Scan
                    </Text>
                    <SelectRangePicker
                        value={filters?.dateRange}
                        onChange={(range) => onChange('dateRange', range)}
                        style={{ marginTop: 4, borderRadius: 8, width: '100%' }}
                    />
                </Col>
                <Col span={4}>
                    <Text strong style={{ color: '#1890ff' }}>
                        📝 Status
                    </Text>
                    <Select
                        value={filters?.status || 'All'}
                        style={{ marginTop: 4, borderRadius: 8, width: '100%' }}
                        onChange={(value) => onChange('status', value)}
                        allowClear
                        placeholder="Semua Status"
                    >
                        <Option value="All">Semua</Option>
                        <Option value="Good">Good</Option>
                        <Option value="Bad">Bad</Option>
                    </Select>
                </Col>
                <Col span={7}>
                    <Text strong style={{ color: '#1890ff' }}>
                        🔍 Cari Produk
                    </Text>
                    <Input
                        value={search}
                        suffix={<SearchOutlined />}
                        allowClear
                        placeholder="Nama produk atau kode..."
                        style={{ marginTop: 4, borderRadius: 8 }}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            debounce(e.target.value);
                        }}
                    />
                </Col>
                <Col span={4}>
                    <Button
                        danger
                        type="primary"
                        onClick={() => setVisible(true)}
                        style={{
                            width: '100%',
                            marginTop: 24,
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px #ff4d4f22',
                        }}
                        icon={<QrcodeOutlined />}
                    >
                        Reject Label
                    </Button>
                </Col>
                <Col span={2}>
                    <Button
                        onClick={() => setHistory((v) => !v)}
                        type="primary"
                        icon={history ? <CloseOutlined /> : <HistoryOutlined />}
                        style={{ backgroundColor: '#595959', marginTop: 24, fontWeight: 'bold' }}
                    >
                        {history ? 'Close History' : 'History Log'}
                    </Button>
                </Col>
            </Row>
        </Card>
    );
}
