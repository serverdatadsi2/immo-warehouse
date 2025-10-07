import SelectRangePicker from '@/components/date-picker/range-picker';
import { DateTimeDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { useDebounce } from '@/hooks/use-debounce';
import axiosIns from '@/lib/axios';
import { FilterQc, InboundQC, MonitoringInboundQc } from '@/types/inbound-qc.type';
import { QrcodeOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Col, Input, Row, Select, Statistic, TableProps, Tag } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import RejectLabelingModal from './reject-labeling';

const { Option } = Select;

const TableMonitoring = () => {
    const [filters, setFilters] = useState<FilterQc>({
        status: 'All',
        search: '',
        dateRange: [dayjs(), dayjs()],
        page: 1,
    });
    const [search, setSearch] = useState<string>();
    const [visible, setVisible] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['monitoring-inboun-qc', filters],
        queryFn: async () => {
            const res = await axiosIns.get<MonitoringInboundQc>('/inbound-qc/monitoring-inbound', {
                params: {
                    page: filters.page,
                    status: filters.status,
                    search: filters.search,
                    from: filters.dateRange?.[0].toISOString(),
                    to: filters.dateRange?.[1].toISOString(),
                },
            });
            return res.data;
        },
    });

    const columns = useMemo(
        (): TableProps<InboundQC>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: InboundQC, index: number) => {
                    const currentPage = data?.pagination?.current_page ?? 1;
                    const perPage = 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            { title: 'Product Name', dataIndex: 'product_name' },
            { title: 'RFID Tag', dataIndex: 'rfid', render: (text) => <code>{text}</code> },
            { title: 'Gudang', dataIndex: 'warehouse_name' },
            {
                title: 'Waktu Scan',
                dataIndex: 'scan_time',
                render: (val) => <DateTimeDisplay val={val} />,
            },
            {
                title: 'Status',
                dataIndex: 'status',
                render: (status) => (
                    <Tag color={status === 'Good' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
                ),
            },
            { title: 'Kondisi', dataIndex: 'condition' },
        ],
        [data],
    );

    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({
            status: key === 'status' ? value : (prev?.status ?? ''),
            search: key === 'search' ? value : (prev?.search ?? ''),
            dateRange: key === 'dateRange' ? value : (prev?.dateRange ?? null),
            page: key === 'page' ? value : (prev?.page ?? 1),
        }));
    }, []);

    const debounce = useDebounce((val: string) => {
        handleFilterChange('search', val);
    }, 300);

    return (
        <div>
            <Row gutter={16}>
                <Col span={6}>
                    <Card className="!bg-gray-50">
                        <Statistic title="Total Item Diperiksa" value={data?.summary.grand_total} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="!bg-gray-100">
                        <Statistic title="Kondisi Baik" value={data?.summary.good_qty} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="!bg-gray-100">
                        <Statistic title="Kondisi Buruk" value={data?.summary.bad_dty} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="!bg-gray-100">
                        <Statistic
                            title="Kondisi Buruk Tertinggi"
                            value={
                                data?.summary.highestBadProduct.percentage
                                    ? `${data?.summary.highestBadProduct.product_name} (${data?.summary.highestBadProduct.percentage} %)`
                                    : '-'
                            }
                            valueStyle={{ fontSize: 16 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: '24px' }}>
                <Row gutter={16} align="bottom">
                    <Col span={6}>
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
                            value={filters?.status || 'All'}
                            style={{ width: '100%' }}
                            onChange={(value) => handleFilterChange('status', value)}
                            allowClear
                        >
                            <Option value="All">Semua</Option>
                            <Option value="Good">Good</Option>
                            <Option value="Bad">Bad</Option>
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
                    <Col span={8}>
                        <Row gutter={8}>
                            <Col span={12}>
                                <Button
                                    type="primary"
                                    onClick={() => refetch()}
                                    style={{ width: '100%' }}
                                >
                                    Terapkan Filter
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    danger
                                    type="default"
                                    onClick={() => setVisible(true)}
                                    style={{ width: '100%' }}
                                    icon={<QrcodeOutlined />}
                                >
                                    Reject Label
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            <CustomTable<InboundQC>
                size="small"
                style={{ marginTop: '24px' }}
                columns={columns}
                dataSource={data?.data}
                loading={isLoading}
                onPaginationChange={(page) => handleFilterChange('page', page)}
                page={data?.pagination.current_page || 1}
                bordered
                rowKey="rfid"
            />

            <RejectLabelingModal
                visible={visible}
                onClose={() => {
                    refetch();
                    setVisible(false);
                }}
            />
        </div>
    );
};

export default TableMonitoring;
