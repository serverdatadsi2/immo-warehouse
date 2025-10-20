import { DateDisplay } from '@/components/displays/date-display';
import { router } from '@inertiajs/react';
import type { DescriptionsProps } from 'antd';
import { Button, Descriptions, message, notification } from 'antd';
import React, { useCallback, useContext, useMemo } from 'react';
import { DetailContext } from '../../detail';

const DescriptionHeader: React.FC = () => {
    const { header } = useContext(DetailContext);

    const handleProcess = useCallback(() => {
        router.patch(
            `/receiving-order/ecommerce/${header?.id}/process`,
            {},
            {
                onSuccess: () => {
                    message.success('Order berhasil diproses ✅');
                },
                onError: (e) => {
                    notification.error({
                        message: 'Error',
                        description: e.message || 'Terjadi kesalahan saat memproses order.',
                        duration: 10,
                    });
                },
            },
        );
    }, [header]);

    const items: DescriptionsProps['items'] = useMemo(() => {
        const baseItems = [
            {
                key: '1',
                label: 'Nomor  Order',
                children: header?.order_number,
            },
            {
                key: '2',
                label: 'Order By',
                children: header?.customer_name,
            },
            {
                key: '3',
                label: 'Paid At',
                children: <DateDisplay val={header?.completed_at} />,
            },
        ];

        if (header?.status === 'paid') {
            baseItems.push({
                key: '4',
                label: 'Action',
                children: (
                    <Button onClick={handleProcess} type="primary">
                        Proses
                    </Button>
                ),
            });
        }

        return baseItems;
    }, [header, handleProcess]);

    return (
        <Descriptions layout="vertical" column={header?.status === 'paid' ? 4 : 3} items={items} />
    );
};

export default DescriptionHeader;
