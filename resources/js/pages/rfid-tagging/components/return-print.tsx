import { PrintButton } from '@/components/buttons/common-buttons';
import axiosIns from '@/lib/axios';
import { InboundDetailWithRelation } from '@/types/inbound.type';
import { message } from 'antd';
import { useCallback } from 'react';

interface Props {
    selectInbound: InboundDetailWithRelation & {
        store_return_id: string;
    };
}

const PrintComponent = ({ selectInbound }: Props) => {
    const handlePrint = useCallback(async () => {
        try {
            message.loading('Loading...', 0);

            const res = await axiosIns.post(
                '/rfid-tagging/generate-return-rfid-tag-pdf',
                {
                    warehouse_inbound_id: selectInbound.warehouse_inbound_id,
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

    return (
        <>
            <PrintButton onClick={handlePrint} />
        </>
    );
};

export default PrintComponent;
