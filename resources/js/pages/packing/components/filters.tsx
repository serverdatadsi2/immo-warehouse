import { useDebounce } from '@/hooks/use-debounce';
import { Params } from '@/types/receiving-order.type';
import { CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Card, Col, DatePicker, Input, Row, Select, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';

interface Props {
    params: Params;
}

const { RangePicker } = DatePicker;
const { Text } = Typography;

export function Filters({ params }: Props) {
    const [filters, setFilters] = useState({
        search: params.search || '',
        status: params.status || '',
        dateRange: params.dateRange || undefined,
    });

    const applyInertiaFilter = useCallback(
        (key: keyof Params, value: string | undefined) => {
            const newFilters = {
                ...params,
                [key]: value,
            };
            if (!value) delete newFilters[key];
            router.get(route(route().current() ?? 'storage.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [params],
    );

    const debouncedApplySearch = useDebounce((val) => {
        applyInertiaFilter('search', val);
    }, 300);

    const handleFilterChange = useCallback(
        (key, value) => {
            setFilters((prev) => ({
                ...prev,
                [key]: value,
            }));
            if (key === 'search') {
                debouncedApplySearch(value);
            } else {
                applyInertiaFilter(key, value);
            }
        },
        [debouncedApplySearch, applyInertiaFilter],
    );

    const disabledDate = (current) => current && current.isAfter(dayjs().endOf('day'));

    const handleDateRange = useCallback(
        (_, range) => {
            if (range && range[0] && range[1]) {
                handleFilterChange('dateRange', [range[0], range[1]]);
            } else {
                handleFilterChange('dateRange', undefined);
            }
        },
        [handleFilterChange],
    );

    return (
        <Card className="!mb-4 !mr-4" style={{ background: '#f5faff', borderRadius: 10 }}>
            <Row gutter={16} align="middle">
                <Col span={12}>
                    <Text strong style={{ color: '#1890ff' }}>
                        🔍 Cari Order
                    </Text>
                    <Input
                        value={filters.search}
                        suffix={<SearchOutlined />}
                        allowClear
                        placeholder="Nama toko atau nomor order..."
                        style={{ marginTop: 4, borderRadius: 8 }}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </Col>
                <Col span={8}>
                    <Text strong style={{ color: '#1890ff' }}>
                        <CalendarOutlined /> Tanggal Order
                    </Text>
                    <RangePicker
                        disabledDate={disabledDate}
                        format="DD-MM-YYYY"
                        style={{ marginTop: 4, borderRadius: 8, width: '100%' }}
                        value={
                            filters.dateRange
                                ? [
                                      dayjs(filters?.dateRange?.[0], 'DD-MM-YYYY'),
                                      dayjs(filters?.dateRange?.[1], 'DD-MM-YYYY'),
                                  ]
                                : undefined
                        }
                        onChange={handleDateRange}
                        placeholder={['Mulai', 'Selesai']}
                    />
                </Col>
                <Col span={4}>
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
                        <Select.Option value="received">Received</Select.Option>
                        <Select.Option value="processing">Processing</Select.Option>
                        <Select.Option value="packing">Packing</Select.Option>
                    </Select>
                </Col>
            </Row>
        </Card>
    );
}
