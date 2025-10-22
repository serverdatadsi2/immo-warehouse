import { DateTimeDisplay } from '@/components/displays/date-display';
import CustomTable from '@/components/tables/custom-table';
import { InboundQC, MonitoringInboundQc } from '@/types/inbound-qc.type';
import { Card, TableProps, Tag } from 'antd';
import { useMemo } from 'react';

interface Props {
    data: MonitoringInboundQc | undefined;
    loading: boolean;
    history: boolean;
    onChange: (key: any, value: any) => void;
}

const TableMonitoring = ({ data, loading, onChange, history }: Props) => {
    const columns = useMemo(
        (): TableProps<InboundQC>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: InboundQC, index: number) => {
                    const currentPage = data?.pagination?.current_page ?? 1;
                    const perPage = 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            { title: 'Product Name', dataIndex: 'product_name', align: 'left' },
            {
                title: 'RFID Tag',
                dataIndex: 'rfid',
                render: (text) => <code>{text}</code>,
                align: 'center',
            },
            {
                title: 'Location Sugestion',
                // dataIndex: 'warehouse_name',
                align: 'center',
                render: (_, record) => {
                    const parts: string[] = [];
                    if (record?.warehouse_name) parts.push(record?.warehouse_name);
                    if (record?.room_name) parts.push(record?.room_name);
                    if (record?.rack_name) parts.push(record?.rack_name);
                    if (record?.layer_name) parts.push(record?.layer_name);
                    return parts.join(' > ');
                },
            },
            {
                title: 'Waktu Scan',
                dataIndex: 'scan_time',
                render: (val) => <DateTimeDisplay val={val} />,
                align: 'center',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                align: 'center',
                render: (status) => (
                    <Tag color={status === 'Good' ? 'green' : 'red'} style={{ fontWeight: 'bold' }}>
                        {status ? status.toUpperCase() : '-'}
                    </Tag>
                ),
            },
            { title: 'Kondisi', dataIndex: 'condition', align: 'center' },
        ],
        [data],
    );

    return (
        <Card
            size="small"
            style={{
                background: history ? '#bfbfbf' : '#f5faff',
                // background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <CustomTable<InboundQC>
                size="small"
                style={{ marginTop: '24px' }}
                columns={columns}
                dataSource={data?.data}
                loading={loading}
                onPaginationChange={(page) => onChange('page', page)}
                page={data?.pagination.current_page || 1}
                bordered
                rowKey="rfid"
            />
        </Card>
    );
};

export default TableMonitoring;
