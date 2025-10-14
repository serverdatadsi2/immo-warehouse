import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import type { DescriptionsProps } from 'antd';
import { Descriptions } from 'antd';
import { useContext, useMemo } from 'react';
import { DetailContext } from '../../detail';

const DescriptionHeader = () => {
    const { headerData } = useContext(DetailContext);
    const { props } = usePage<SharedData>();

    const items: DescriptionsProps['items'] = useMemo(() => {
        const baseItems = [
            {
                key: '1',
                label: 'Warehouse',
                children: headerData ? headerData?.warehouse?.name : props.auth.warehouses[0].name,
            },
            {
                key: '2',
                label: 'User Outbound',
                children: headerData ? headerData.user?.name : props.auth.user.name,
            },
        ];

        if (headerData?.id) {
            baseItems.push({
                key: '4',
                label: 'Nomor Faktur',
                children: headerData.delivery_order_number,
            });
            baseItems.push({
                key: '5',
                label: 'Surat Jalan',
                children: headerData.invoice_number,
            });
        }

        baseItems.push({
            key: '3',
            label: 'Quantity',
            children: headerData?.quantity_item?.toString() || '0',
        });

        return baseItems;
    }, [headerData, props]);

    return <Descriptions layout="vertical" column={headerData?.id ? 5 : 3} items={items} />;
};

export default DescriptionHeader;
