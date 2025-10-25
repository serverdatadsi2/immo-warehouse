import { PrintButton } from '@/components/buttons/common-buttons';
import axiosIns from '@/lib/axios';
import { InboundDetailWithRelation } from '@/types/inbound.type';
import { InsertItems, Item } from '@/types/item.type';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { useCallback } from 'react';
interface Props {
    selectInbound: InboundDetailWithRelation;
}

const QRCodePrinter = ({ selectInbound }: Props) => {
    const { mutate } = useMutation({
        mutationFn: (payload: InsertItems) =>
            // axiosIns.post<RFIDTag[]>('/rfid-tagging/create-rfid', payload),
            axiosIns.post<Item[]>('/rfid/tagging/generate-rfid-tag', payload),
        onSuccess: (res) => {
            if (res.data) {
                handlePrint(res.data);
            }
        },
        onError: () => {
            message.success('Print QRCode Gagal dilakukan');
            message.destroy();
        },
    });

    const handleClick = useCallback(() => {
        message.loading('loading...', 0);
        mutate({
            quantity: selectInbound?.quantity || 0,
            warehouse_inbound_detail_id: selectInbound.id,
            expired_date: selectInbound.expired_date,
            product_id: selectInbound.product_id,
        });
    }, [mutate, selectInbound]);

    const handlePrint = useCallback(
        async (datas: Item[]) => {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            const qrSize = 20; // mm
            const cols = 3; // fix 3 kolom
            const cellWidth = pageWidth / cols;
            const cellHeight = 28; // tinggi slot tiap QR

            let x = 10;
            let y = 10;

            for (const [i, { rfid_tag_id }] of datas.entries()) {
                // generate QR unik untuk setiap value
                const qrDataUrl = await QRCode.toDataURL(rfid_tag_id, { width: 200 });

                // gambar QR
                doc.addImage(qrDataUrl, 'PNG', x, y, qrSize, qrSize);

                // value (UUID) di bawah QR
                doc.setFontSize(7);
                doc.text(rfid_tag_id, x + 2, y + qrSize + 2);

                // nama & kode produk di kanan QR
                doc.setFontSize(8);
                doc.text(`${selectInbound?.product_name ?? ''}`, x + qrSize + 2, y + 4);
                doc.text(`Code: ${selectInbound?.product_code ?? ''}`, x + qrSize + 2, y + 8);

                // pindah posisi ke kolom berikutnya
                if ((i + 1) % cols === 0) {
                    // habis 3 kolom → turun baris
                    x = 10;
                    y += cellHeight;
                } else {
                    x += cellWidth;
                }

                // cek kalau melewati halaman
                if (y + cellHeight > pageHeight) {
                    doc.addPage();
                    x = 10;
                    y = 10;
                }
            }
            message.destroy();
            message.success('Print QRCode berhasil dilakukan');
            doc.save(`QRCode-${selectInbound.product_name}.pdf`);
        },
        [selectInbound],
    );

    return <PrintButton onClick={handleClick} />;
};

export default QRCodePrinter;
