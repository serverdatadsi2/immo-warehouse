import { StagingWithRelations } from '@/types/warehouse-staging.type';
import type { DescriptionsProps } from 'antd';
import { Card, Descriptions } from 'antd';
import { useMemo } from 'react';

interface Props {
    header: StagingWithRelations;
}
const DescriptionHeader = ({ header }: Props) => {
    const items: DescriptionsProps['items'] = useMemo(
        () => [
            {
                key: '1',
                label: 'Warehouse',
                children: header?.warehouse.name,
            },
            {
                key: '2',
                label: 'Staging Name',
                children: header?.name,
            },
            {
                key: '3',
                label: 'Grand Total',
                children: header.quantity,
            },
        ],
        [header],
    );

    return (
        <Card
            style={{
                background: '#f5faff',
                boxShadow: '0 2px 8px #1890ff11',
            }}
        >
            <Descriptions title="Header Staging Area" layout="vertical" column={3} items={items} />
        </Card>
    );
};

export default DescriptionHeader;
