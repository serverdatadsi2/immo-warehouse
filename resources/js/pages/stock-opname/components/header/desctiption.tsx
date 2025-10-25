import { usePermission } from '@/hooks/use-permission';
import { formatDate } from '@/lib/utils';
import { router } from '@inertiajs/react';
import type { DescriptionsProps } from 'antd';
import { Button, Descriptions, message } from 'antd';
import { ClipboardCheck, LoaderPinwheel } from 'lucide-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { DetailContext } from '../../monitoring';
import { renderStatusStockOpname } from './table';

const DescriptionHeader: React.FC = () => {
    const { hasPermission } = usePermission();
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

    const handleProcess = useCallback(() => {
        router.put(
            `/stock-opname/${header?.id}/process`,
            {},
            {
                onSuccess: () => message.success('Stock Opname berhasil di process'),
                onError: (e) => {
                    message.success('Stock Opname gagal di process');
                    // eslint-disable-next-line no-console
                    console.error(e, 'error update monitoring stock opname');
                },
            },
        );
    }, [header]);

    const handleUpdateStock = useCallback(() => {
        router.post(
            `/stock-opname/update-stock`,
            { warehouse_stock_opname_id: header?.id },
            {
                onSuccess: () => message.success('Stock berhasil di update'),
                onError: (e) => {
                    message.success('Stock gagal di process');
                    // eslint-disable-next-line no-console
                    console.error(e, 'error update stock in stock opname');
                },
            },
        );
    }, [header]);

    return (
        <Descriptions
            title={`Kode : ${header?.code}`}
            extra={
                header?.status === 'draft' ? (
                    hasPermission('stock_opname.validate') ? (
                        <Button
                            type="primary"
                            style={{ backgroundColor: '#874d00' }}
                            onClick={handleProcess}
                            icon={<ClipboardCheck size={16} />}
                        >
                            Validasi Stok
                        </Button>
                    ) : null
                ) : (
                    header?.status === 'in_progress' &&
                    hasPermission('stock_opname.approve') && (
                        <Button
                            type="primary"
                            style={{ backgroundColor: '#3f6600' }}
                            onClick={handleUpdateStock}
                            icon={<LoaderPinwheel size={16} />}
                        >
                            Approval
                        </Button>
                    )
                )
            }
            layout="vertical"
            column={header?.completed_at ? 5 : 4}
            items={items}
        />
    );
};

export default DescriptionHeader;
