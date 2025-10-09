import SelectRangePicker from '@/components/date-picker/range-picker';
import { useDebounce } from '@/hooks/use-debounce';
import { FilterQc } from '@/types/inbound-qc.type';
import { QrcodeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Select } from 'antd';
import { useCallback } from 'react';

interface Props {
    setFilters: React.Dispatch<React.SetStateAction<FilterQc>>;
    filters: FilterQc;
    setSearch: React.Dispatch<React.SetStateAction<string | undefined>>;
    search: string | undefined;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
export function Filters({ filters, setFilters, setSearch, search, setVisible }: Props) {
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
        <Card>
            <Row gutter={16} align="bottom">
                <Col span={10}>
                    Tanggal Scan
                    <br />
                    <SelectRangePicker
                        value={filters?.dateRange}
                        onChange={(range) => handleFilterChange('dateRange', range)}
                    />
                </Col>
                <Col span={4}>
                    Status
                    <br />
                    <Select
                        value={filters?.status || ''}
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange('status', value)}
                        allowClear
                    >
                        <Select.Option value="">All</Select.Option>
                        <Select.Option value="accepted">Accepted</Select.Option>
                        <Select.Option value="rejected">Rejected</Select.Option>
                    </Select>
                </Col>
                <Col span={6}>
                    Cari Produk
                    <br />
                    <Input
                        value={search}
                        suffix={<SearchOutlined />}
                        allowClear
                        placeholder="Cari Nama Produk..."
                        onChange={(e) => {
                            setSearch(e.target.value);
                            debounce(e.target.value);
                        }}
                    />
                </Col>
                <Col span={4}>
                    <Button
                        danger
                        type="default"
                        onClick={() => setVisible(true)}
                        style={{ width: '100%' }}
                        icon={<QrcodeOutlined />}
                    >
                        Rejected
                    </Button>
                </Col>
            </Row>
        </Card>
    );
}
