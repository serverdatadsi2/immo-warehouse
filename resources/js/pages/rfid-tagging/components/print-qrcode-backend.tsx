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
        try {
            message.loading('Loading...', 0);

            const res = await axiosIns.post(
                '/rfid-tagging/generate-rfid-tag-pdf',
                {
                    quantity: selectInbound?.quantity || 0,
                    warehouse_inbound_detail_id: selectInbound.id,
                    expired_date: selectInbound.expired_date,
                    product_id: selectInbound.product_id,
                },
                { responseType: 'blob' },
            );

            // cek apakah response PDF atau JSON error
            const contentType = res.headers['content-type'];

            if (contentType && contentType.includes('application/json')) {
                // convert blob -> json
                const text = await res.data.text();
                const errorData = JSON.parse(text);

                throw new Error(errorData.message || 'Terjadi kesalahan saat generate PDF');
            }

            // kalau benar PDF
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            window.open(url, '_blank');
            message.destroy();
            message.success('PDF berhasil digenerate');
        } catch (err: any) {
            message.destroy();
            message.error(err.message || 'Gagal generate PDF');
        }
    }, [selectInbound]);

    return <PrintButton onClick={handleClick} />;
};

export default QRCodePrinter;
