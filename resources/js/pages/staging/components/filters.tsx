import { AddButton } from '@/components/buttons/crud-buttons';
import { useDebounce } from '@/hooks/use-debounce';
import { Params } from '@/types/receiving-order.type';
import { SearchOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Card, Col, Input, Row, Select, Space, Typography } from 'antd';
import { TextCursorInput } from 'lucide-react';
import { useCallback, useState } from 'react';
const { Text } = Typography;

interface Props {
    params: Params;
}
export function Filters({ params }: Props) {
    const [filters, setFilters] = useState({
        search: params.search || '',
        status: params.status || 'All',
    });

    const applyInertiaFilter = useCallback(
        (key: keyof Params, value: string | undefined) => {
            const currentInertiaFilters = { ...params };
            const newFilters = { ...currentInertiaFilters, [key]: value };
            if (!value) delete newFilters[key];
            router.get(route(route().current() ?? 'staging.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [params],
    );

    const debounce = useDebounce((val: string) => {
        applyInertiaFilter('search', val);
    }, 300);

    const handleFilterChange = useCallback(
        (key, value) => {
            setFilters((prev) => ({
                ...prev,
                [key]: value,
            }));
            if (key === 'search') debounce(value);
            else applyInertiaFilter(key, value);
        },
        [applyInertiaFilter, debounce],
    );

    const handleAdd = useCallback(() => {
        router.get('/staging/manual-input');
    }, []);
    return (
        <Card
            style={{
                background: '#f5faff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #1890ff11',
                marginBottom: 24,
            }}
        >
            <Row gutter={24} align="middle" justify="space-between">
                <Col>
                    <Space size={20}>
                        <div>
                            <Text strong style={{ color: '#1890ff' }}>
                                🔍 Cari Staging
                            </Text>
                            <br />
                            <Input
                                suffix={<SearchOutlined />}
                                placeholder="Nama staging..."
                                style={{ width: 500, marginTop: 4, borderRadius: 8 }}
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                allowClear
                            />
                        </div>
                        <div>
                            <Text strong style={{ color: '#1890ff' }}>
                                🗂 Status
                            </Text>
                            <br />
                            <Select
                                value={filters.status}
                                onChange={(value) => handleFilterChange('status', value)}
                                style={{ width: 120, marginTop: 4, borderRadius: 8 }}
                            >
                                <Select.Option value="">Semua</Select.Option>
                                <Select.Option value="active">Active</Select.Option>
                                <Select.Option value="relesed">Release</Select.Option>
                            </Select>
                        </div>
                    </Space>
                </Col>
                <Col>
                    <AddButton icon={<TextCursorInput />} onClick={handleAdd}>
                        Manual Input
                    </AddButton>
                </Col>
            </Row>
        </Card>
    );
}
