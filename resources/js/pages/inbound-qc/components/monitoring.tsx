import axiosIns from '@/lib/axios';
import { FilterQc, InboundQcSummary, MonitoringInboundQc } from '@/types/inbound-qc.type';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import Filter from './filter';
import RejectLabelingModal from './reject-labeling';
import SummaryCard from './summary-card';
import TableMonitoring from './table';

const MonitoringComponent = () => {
    const [filters, setFilters] = useState<FilterQc>({
        status: 'All',
        search: '',
        dateRange: [dayjs(), dayjs()],
        page: 1,
    });
    const [visible, setVisible] = useState(false);
    const [historyMode, setHistoryMode] = useState<boolean>(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['monitoring-inboun-qc', filters, historyMode],
        queryFn: async () => {
            const res = await axiosIns.get<MonitoringInboundQc>(
                historyMode ? '/inbound-qc/history-inbound' : '/inbound-qc/monitoring-inbound',
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

    const { data: summary, refetch: summaryRefect } = useQuery({
        queryKey: ['sumarry-inboun-qc', filters.dateRange, historyMode],
        queryFn: async () => {
            const res = await axiosIns.get<InboundQcSummary>(
                historyMode ? '/inbound-qc/summary-history-inbound' : '/inbound-qc/summary-inbound',
                {
                    params: {
                        // page: filters.page,
                        // status: filters.status,
                        // search: filters.search,
                        from: filters.dateRange?.[0].toISOString(),
                        to: filters.dateRange?.[1].toISOString(),
                    },
                },
            );
            return res.data;
        },
    });

    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({
            status: key === 'status' ? value : (prev?.status ?? ''),
            search: key === 'search' ? value : (prev?.search ?? ''),
            dateRange: key === 'dateRange' ? value : (prev?.dateRange ?? null),
            page: key === 'page' ? value : (prev?.page ?? 1),
        }));
    }, []);

    return (
        <div>
            <SummaryCard data={summary} />

            <Filter
                filters={filters}
                onChange={handleFilterChange}
                setVisible={setVisible}
                history={historyMode}
                setHistory={setHistoryMode}
            />

            <TableMonitoring
                data={data}
                onChange={handleFilterChange}
                loading={isLoading}
                history={historyMode}
            />

            <RejectLabelingModal
                visible={visible}
                onClose={() => {
                    refetch();
                    summaryRefect();
                    setVisible(false);
                }}
            />
        </div>
    );
};

export default MonitoringComponent;
