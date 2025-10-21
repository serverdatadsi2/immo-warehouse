import { useDebounce } from '@/hooks/use-debounce';
import { Params } from '@/types/stock-opname.type';
import { CalendarOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, Card, Col, DatePicker, Input, message, Row, Select, Typography } from 'antd';
import dayjs from 'dayjs';
import { TextCursorInput } from 'lucide-react';
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

            if (!value) {
                delete newFilters[key];
            }

            router.get(route(route().current() ?? 'stock-opname.index'), newFilters, {
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

    const handleClear = useCallback(() => {
        router.visit('/stock-opname', { replace: true });
    }, []);

    const disabledDate = (current) => {
        return current && current.isAfter(dayjs().endOf('day'));
    };

    const handleDateRange = useCallback(
        (range) => {
            if (range && range[0] && range[1]) {
                handleFilterChange('dateRange', [range[0].toISOString(), range[1].toISOString()]);
            } else {
                handleFilterChange('dateRange', undefined);
            }
        },
        [handleFilterChange],
    );

    const handleManualStockOpname = useCallback(() => {
        router.post(
            '/stock-opname/manual-stock-opname',
            {},
            {
                onSuccess: () => message.success('Manual stock opname success created'),
                // eslint-disable-next-line no-console
                onError: (e) => console.error(e, 'error create manual stock opname'),
            },
        );
    }, []);

    return (
        <Card
            className="!mb-4"
            style={{
                background: '#f5faff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <Row gutter={16} align="middle">
                <Col span={10}>
                    <Text strong style={{ color: '#1890ff' }}>
                        🔍 Cari Kode Stock Opname
                    </Text>
                    <Input
                        value={filters.search}
                        suffix={<SearchOutlined />}
                        allowClear
                        placeholder="Kode stok opname..."
                        style={{ marginTop: 4, borderRadius: 8 }}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </Col>
                <Col span={6}>
                    <Text strong style={{ color: '#1890ff' }}>
                        <CalendarOutlined /> Tanggal Stock Opname
                    </Text>
                    <RangePicker
                        disabledDate={disabledDate}
                        format="DD-MM-YYYY"
                        style={{ marginTop: 4, borderRadius: 8, width: '100%' }}
                        value={
                            filters.dateRange
                                ? [dayjs(filters?.dateRange?.[0]), dayjs(filters?.dateRange?.[1])]
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
                        value={filters.status}
                        style={{ marginTop: 4, borderRadius: 8, width: '100%' }}
                        onChange={(value) => handleFilterChange('status', value)}
                        allowClear
                        placeholder="Semua Status"
                    >
                        <Select.Option value="draft">Draft</Select.Option>
                        <Select.Option value="in_progress">In Progress</Select.Option>
                        <Select.Option value="completed">Complated</Select.Option>
                        <Select.Option value="">All</Select.Option>
                    </Select>
                </Col>
                {filters.search !== '' ||
                filters.dateRange !== undefined ||
                filters.status !== '' ? (
                    <Col span={4}>
                        <Button
                            icon={<CloseOutlined />}
                            danger
                            onClick={handleClear}
                            style={{
                                width: '100%',
                                marginTop: 24,
                                fontWeight: 'bold',
                                boxShadow: '0 2px 8px #ff4d4f22',
                            }}
                        >
                            Reset Filter
                        </Button>
                    </Col>
                ) : (
                    <Col span={4}>
                        <Button
                            icon={<TextCursorInput />}
                            type="primary"
                            style={{
                                width: '100%',
                                marginTop: 24,
                                fontWeight: 'bold',
                                boxShadow: '0 2px 8px #ff4d4f22',
                            }}
                            onClick={handleManualStockOpname}
                        >
                            Manual Opname
                        </Button>
                    </Col>
                )}
            </Row>
        </Card>
    );
}
