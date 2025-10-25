import { DateDisplay } from '@/components/displays/date-display';
import { usePermission } from '@/hooks/use-permission';
import { router } from '@inertiajs/react';
import type { DescriptionsProps } from 'antd';
import { Button, Descriptions, message, notification } from 'antd';
import React, { useCallback, useContext, useMemo } from 'react';
import { DetailContext } from '../../detail';

const DescriptionHeader: React.FC = () => {
    const { hasPermission } = usePermission();
    const { header } = useContext(DetailContext);

    const handleProcess = useCallback(() => {
        router.patch(
            `/receiving-order/store-order/${header?.id}/process`,
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
                label: 'Di Setujui Oleh',
                children: header?.approved_name,
            },
            {
                key: '3',
                label: 'Tanggal Disetujui',
                children: <DateDisplay val={header?.approved_at} />,
            },
        ];

        if (header?.status === 'approved' && hasPermission('receiving_order.store.process')) {
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
    }, [header, handleProcess, hasPermission]);

    return (
        <Descriptions
            title={`Store Order : ${header?.store_name}`}
            layout="vertical"
            column={header?.status === 'approved' ? 4 : 3}
            items={items}
        />
    );
};

export default DescriptionHeader;
