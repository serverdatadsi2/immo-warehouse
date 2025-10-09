import { DateTimeDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import axiosIns from '@/lib/axios';
import { FilterQc, InboundQC } from '@/types/inbound-qc.type';
import { SimplePagination } from '@/types/laravel-pagination.type';
import { useQuery } from '@tanstack/react-query';
import { TableProps, Tag } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { Filters } from './filter';
import RejectedModalForm from './reject-form';

const LogTable = () => {
    const [visible, setVisible] = useState<boolean>(false);

    const [search, setSearch] = useState<string>();

    const [filters, setFilters] = useState<FilterQc>({
        status: 'All',
        search: '',
        dateRange: [dayjs(), dayjs()],
        page: 1,
    });

    const {
        data: pagination,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['monitoring-outbound-qc', filters],
        queryFn: async () => {
            const res = await axiosIns.get<SimplePagination<OutboundQC>>(
                '/outbound-qc/monitoring-outbound',
                {
                    params: {
                        page: filters.page,
                        status: filters.status,
                        search: filters.search,
                        from: filters.dateRange?.[0].toISOString(),
                        to: filters.dateRange?.[1].toISOString(),
                    },
                },
            );
            return res.data;
        },
    });

    const columns = useMemo(
        (): TableProps<InboundQC>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: InboundQC, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            { title: 'Product Name', dataIndex: 'product_name' },
            { title: 'RFID Tag', dataIndex: 'rfid', render: (text) => <code>{text}</code> },
            {
                title: 'Waktu Scan',
                dataIndex: 'scan_time',
                render: (val) => <DateTimeDisplay val={val} />,
            },
            {
                title: 'Status',
                dataIndex: 'status',
                render: (status) => (
                    <Tag color={status === 'accepted' ? 'green' : 'red'}>
                        {status.toUpperCase()}
                    </Tag>
                ),
            },
            { title: 'Note', dataIndex: 'note' },
        ],
        [pagination],
    );
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

    return (
        <div>
            <Filters
                filters={filters}
                setFilters={setFilters}
                setSearch={setSearch}
                search={search}
                setVisible={setVisible}
            />

            <CustomTable<InboundQC>
                size="small"
                style={{ marginTop: '24px' }}
                columns={columns}
                dataSource={pagination?.data}
                loading={isLoading}
                onPaginationChange={(page) => handleFilterChange('page', page)}
                page={pagination?.current_page || 1}
                bordered
                rowKey="rfid"
            />

            <RejectedModalForm
                visible={visible}
                onClose={() => {
                    refetch();
                    setVisible(false);
                }}
            />
        </div>
    );
};

export default LogTable;

type OutboundQC = InboundQC;
