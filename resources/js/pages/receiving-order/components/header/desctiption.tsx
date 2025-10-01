import { DateDisplay } from '@/components/displays/date-display';
import { router } from '@inertiajs/react';
import type { DescriptionsProps } from 'antd';
import { Button, Descriptions, message } from 'antd';
import React, { useCallback, useContext, useMemo } from 'react';
import { DetailContext } from '../../detail';

const DescriptionHeader: React.FC = () => {
    const { header } = useContext(DetailContext);

    const handleProcess = useCallback(() => {
        router.patch(
            `/receiving-order/${header?.id}/process`,
            {},
            {
                onSuccess: () => {
                    message.success('Order berhasil diproses ✅');
                },
                onError: (e) => {
                    message.error(e.error);
                },
            },
        );
    }, [header]);

    const items: DescriptionsProps['items'] = useMemo(
        () => [
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
            {
                key: '4',
                label: 'Action',
                children: (
                    <Button onClick={handleProcess} type="primary">
                        Proses
                    </Button>
                ),
            },
        ],
        [header, handleProcess],
    );

    return (
        <Descriptions
            title={`Store Order : ${header?.store_name}`}
            layout="vertical"
            column={2}
            items={items}
        />
    );
};

export default DescriptionHeader;
