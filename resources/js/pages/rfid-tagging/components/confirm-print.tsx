import { PrintButton } from '@/components/buttons/common-buttons';
import axiosIns from '@/lib/axios';
import { InboundDetailWithRelation } from '@/types/inbound.type';
import { InputNumber, message, Modal, Typography } from 'antd';
import { useCallback, useState } from 'react';

const { Text } = Typography;
interface Props {
    selectInbound: InboundDetailWithRelation & {
        store_return_id: string;
    };
}

const ConfirmPrint = ({ selectInbound }: Props) => {
    const [open, setOpen] = useState(false);
    const [qty, setQty] = useState(0);

    const handlePrint = useCallback(async () => {
        try {
            message.loading('Loading...', 0);

            const res = await axiosIns.post(
                '/rfid-tagging/generate-return-rfid-tag-pdf',
                {
                    quantity: qty || 0,
                    warehouse_inbound_detail_id: selectInbound.id,
                    expired_date: selectInbound.expired_date,
                    product_id: selectInbound.product_id,
                    store_return_id: selectInbound.store_return_id,
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
            setOpen(false);
            setQty(0);
        } catch (err: any) {
            message.destroy();
            message.error(err.message || 'Gagal generate PDF');
        }
    }, [qty, selectInbound]);

    return (
        <>
            <PrintButton onClick={() => setOpen(true)} disabled />
            <Modal
                title={
                    <Text strong style={{ color: '#ad6800' }}>
                        Print Return RFID untuk {selectInbound.product_name}
                    </Text>
                }
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setQty(0);
                }}
                onOk={handlePrint}
                okButtonProps={{ disabled: !qty || qty > selectInbound.quantity }}
                okText="Print Sekarang"
                cancelText="Batal"
            >
                <div style={{ marginBottom: 12 }}>
                    <Text>
                        Masukkan jumlah RFID yang ingin dicetak. Maksimal{' '}
                        <strong>{selectInbound.quantity}</strong>.
                    </Text>
                </div>

                <InputNumber
                    min={1}
                    max={selectInbound.quantity}
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e ?? 0)}
                    style={{ width: '100%' }}
                    placeholder="Masukkan jumlah RFID Tag"
                />

                <div style={{ marginTop: 8, color: '#ad6800', fontSize: 12 }}>
                    *Pastikan item return product benar-benar tidak memiliki tag RFID.
                </div>
            </Modal>
        </>
    );
};

export default ConfirmPrint;
