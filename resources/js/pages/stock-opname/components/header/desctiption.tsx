import { formatDate } from '@/lib/utils';
import type { DescriptionsProps } from 'antd';
import { Descriptions } from 'antd';
import React, { useContext, useMemo } from 'react';
import { DetailContext } from '../../monitoring';
import { renderStatusStockOpname } from './table';

const DescriptionHeader: React.FC = () => {
    const { header } = useContext(DetailContext);

    const items: DescriptionsProps['items'] = useMemo(() => {
        const baseItems = [
            {
                key: '1',
                label: 'User',
                children: header?.user?.name,
            },
            {
                key: '2',
                label: 'Tanggal',
                children: formatDate(header!.created_at!),
            },
            {
                key: '3',
                label: 'Location Stock Opname',
                children: header?.location?.name,
            },
            {
                key: '4',
                label: 'Status',
                children: renderStatusStockOpname(header?.status),
            },
        ];

        if (header?.completed_at) {
            baseItems.push({
                key: '4',
                label: 'Coplated At',
                children: formatDate(header!.completed_at!),
            });
        }

        return baseItems;
    }, [header]);

    return (
        <Descriptions
            title={`Kode : ${header?.code}`}
            layout="vertical"
            column={header?.completed_at ? 5 : 4}
            items={items}
        />
    );
};

export default DescriptionHeader;
