import { MoneyDisplay } from '@/components/displays/money-display';
import { Table, TableProps } from 'antd';
import { useMemo } from 'react';
import { DetailItem } from '..';

export function DetailChildTable({ data }: Props) {
    const columns = useMemo(
        (): TableProps<DetailItem>['columns'] => [
            // {
            //     title: 'Id',
            //     dataIndex: 'id',
            //     key: 'id',
            // },
            {
                title: 'No.',
                key: 'serial',
                render: (_, __, i) => i + 1,
            },
            {
                title: 'Code',
                dataIndex: 'code',
                key: 'code',
            },
            {
                title: 'Full Code',
                dataIndex: 'code',
                key: 'code',
            },
            {
                title: 'Account Name',
                dataIndex: 'account_name',
                key: 'account_name',
            },
            {
                title: 'Debit',
                dataIndex: 'debit',
                key: 'debit',
                render: (v) => <MoneyDisplay val={v} />,
            },
            {
                title: 'Credit',
                dataIndex: 'credit',
                key: 'credit',
                render: (v) => <MoneyDisplay val={v} />,
            },
        ],
        [],
    );

    return (
        <Table rowKey="id" size="small" columns={columns} dataSource={data} pagination={false} />
    );
}

type Props = {
    data: DetailItem[];
};
