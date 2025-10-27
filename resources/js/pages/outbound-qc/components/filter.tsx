import SelectRangePicker from '@/components/date-picker/range-picker';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermission } from '@/hooks/use-permission';
import { FilterQc } from '@/types/inbound-qc.type';
import { CloseOutlined, HistoryOutlined, QrcodeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Select, Typography } from 'antd';
import { useCallback } from 'react';

const { Text } = Typography;

interface Props {
    setFilters: React.Dispatch<React.SetStateAction<FilterQc>>;
    filters: FilterQc;
    setSearch: React.Dispatch<React.SetStateAction<string | undefined>>;
    search: string | undefined;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setHistory: React.Dispatch<React.SetStateAction<boolean>>;
    history: boolean;
}

export function Filters({
    filters,
    setFilters,
    setSearch,
    search,
    setVisible,
    history,
    setHistory,
}: Props) {
    const { hasPermission } = usePermission();
    const handleFilterChange = useCallback(
        (key, value) => {
            setFilters((prev) => ({
                status: key === 'status' ? value : (prev?.status ?? ''),
                search: key === 'search' ? value : (prev?.search ?? ''),
                dateRange: key === 'dateRange' ? value : (prev?.dateRange ?? null),
                page: key === 'page' ? value : (prev?.page ?? 1),
            }));
        },
        [setFilters],
    );

    const debounce = useDebounce((val: string) => {
        handleFilterChange('search', val);
    }, 300);

    return (
        <Card
            className="!mb-4"
            style={{
                background: history ? '#bfbfbf' : '#f5faff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <Row gutter={16} align="middle">
                <Col span={5}>
                    <Text strong style={{ color: '#1890ff' }}>
                        📅 Tanggal Scan
                    </Text>
                    <SelectRangePicker
                        value={filters?.dateRange}
                        onChange={(range) => handleFilterChange('dateRange', range)}
                        style={{ marginTop: 4, borderRadius: 8, width: '100%' }}
                    />
                </Col>
                <Col span={3}>
                    <Text strong style={{ color: '#1890ff' }}>
                        📝 Status
                    </Text>
                    <Select
                        value={filters?.status || ''}
                        style={{ marginTop: 4, borderRadius: 8, width: '100%' }}
                        onChange={(value) => handleFilterChange('status', value)}
                        allowClear
                        placeholder="Semua Status"
                    >
                        <Select.Option value="">Semua</Select.Option>
                        <Select.Option value="accepted">Diterima</Select.Option>
                        <Select.Option value="rejected">Ditolak</Select.Option>
                    </Select>
                </Col>
                <Col span={9}>
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
                {hasPermission('outbound_qc.reject') && (
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
                            Rejected
                        </Button>
                    </Col>
                )}
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
