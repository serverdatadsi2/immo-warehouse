import { PrintButton } from '@/components/buttons/common-buttons';
import axiosIns from '@/lib/axios';
import { InboundDetailWithRelation } from '@/types/inbound.type';
import { message } from 'antd';
import { useCallback } from 'react';
interface Props {
    selectInbound: InboundDetailWithRelation;
}

const QRCodePrinter = ({ selectInbound }: Props) => {
    const handleClick = useCallback(async () => {
        message.loading('loading...', 0);
        const response = await axiosIns.post(
            '/rfid-tagging/generate-rfid-tag-pdf',
            {
                quantity: selectInbound?.quantity || 0,
                warehouse_inbound_detail_id: selectInbound.id,
                expired_date: selectInbound.expired_date,
                product_id: selectInbound.product_id,
            },
            { responseType: 'blob' },
        );

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        message.destroy();
        // buka di tab baru
        window.open(url, '_blank');
    }, [selectInbound]);

    return <PrintButton onClick={handleClick} />;
};

export default QRCodePrinter;
