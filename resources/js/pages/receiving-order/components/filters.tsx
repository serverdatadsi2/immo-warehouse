import { useDebounce } from '@/hooks/use-debounce';
import { Params } from '@/types/receiving-order.type';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, Card, Col, DatePicker, Input, Row, Select } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';

interface Props {
    params: Params;
}

const { RangePicker } = DatePicker;

export function Filters({ params }: Props) {
    const [filters, setFilters] = useState({
        search: params.search || '',
        status: params.status || 'approved',
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

    const handleClear = useCallback(() => {
        handleFilterChange('search', undefined);
        handleFilterChange('status', 'approved');
        handleFilterChange('dateRange', undefined);
    }, [handleFilterChange]);

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

    return (
        <Card>
            <Row gutter={16} align="bottom">
                <Col span={10}>
                    Cari Order
                    <br />
                    <Input
                        value={filters.search}
                        suffix={<SearchOutlined />}
                        allowClear
                        placeholder="Cari Store atau Nomor Order..."
                        onChange={(e) => {
                            handleFilterChange('search', e.target.value);
                        }}
                    />
                </Col>
                <Col span={6}>
                    Date
                    <br />
                    <RangePicker
                        disabledDate={disabledDate}
                        format="DD-MM-YYYY"
                        value={
                            filters.dateRange
                                ? [dayjs(filters?.dateRange?.[0]), dayjs(filters?.dateRange?.[1])]
                                : undefined
                        }
                        onChange={handleDateRange}
                    />
                </Col>
                <Col span={4}>
                    Status
                    <br />
                    <Select
                        value={filters.status}
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange('status', value)}
                        allowClear
                    >
                        <Select.Option value="approved">Approved</Select.Option>
                        <Select.Option value="received">Received</Select.Option>
                        <Select.Option value="processing">Processing</Select.Option>
                        <Select.Option value="shipped">Shipped</Select.Option>
                    </Select>
                </Col>

                {(filters.search !== '' ||
                    filters.dateRange !== undefined ||
                    filters.status !== 'approved') && (
                    <Col span={4}>
                        <Button
                            icon={<CloseOutlined />}
                            danger
                            onClick={handleClear}
                            style={{ width: '100%' }}
                        >
                            Default Filter
                        </Button>
                    </Col>
                )}
            </Row>
        </Card>
    );
}
