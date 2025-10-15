/* eslint-disable no-console */
import { PrintButton } from '@/components/buttons/common-buttons';
import axiosIns from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { OutboundDetailPrint } from '@/types/warehouse-outbound.type';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { useCallback } from 'react';

interface Props {
    headerId: string;
}

const SuratJalanPrinter = ({ headerId }: Props) => {
    const { mutate } = useMutation({
        mutationFn: () =>
            axiosIns
                .get<OutboundDetailPrint>(`/outbound/detail-outbound/${headerId}`)
                .then((res) => res.data),
        onSuccess: (data) => handlePrint(data),
        onError: (error) => {
            message.destroy();
            message.error('Gagal mencetak Surat Jalan');
            console.error('error get outbound Detail', error);
        },
        onMutate: () => {
            message.loading('Mencetak Surat Jalan...', 0);
        },
    });

    const handlePrint = useCallback(async (data: OutboundDetailPrint) => {
        const { header, details } = data;

        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const marginX = 10;

            // === HEADER DOKUMEN (resmi) ===
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(header.warehouse.name.toUpperCase(), pageWidth / 2, 15, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(header.warehouse.address ?? '-', pageWidth / 2, 20, { align: 'center' });

            // Garis pembatas header
            doc.setLineWidth(0.4);
            doc.line(marginX, 25, pageWidth - marginX, 25);

            // === JUDUL SURAT JALAN ===
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('SURAT JALAN', pageWidth / 2, 31, { align: 'center' });

            // === QR CODE di kanan atas ===
            const qrSize = 25;
            const qrX = pageWidth - marginX - qrSize;
            const qrY = 3; // 27
            const qrDataUrl = await QRCode.toDataURL(header.id, { width: 100 });
            doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

            // Tulisan kecil di bawah QR
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7);
            const textLines = ['Scan QR untuk verifikasi', 'cepat surat jalan'];
            const textX = qrX + qrSize / 2;
            let textY = qrY + qrSize + 2;
            textLines.forEach((line) => {
                doc.text(line, textX, textY, { align: 'center' });
                textY += 3;
            });

            // === INFO PENGIRIMAN ===
            let y = 38;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Informasi Pengiriman', marginX, y);

            y += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);

            const colRightX = pageWidth / 2 + 5;

            // Kolom kanan
            const rightColumn = [
                `No. Surat               : ${header.delivery_order_number}`,
                `Tanggal Dokumen : ${formatDate(header.created_at)}`,
                `Asal                       : ${header.warehouse.name}`,
            ];

            // Kolom kiri
            const alamatTujuan = header.store_order.store.address ?? '-';
            const labelWidth = 28; // lebar teks label sebelum isi (agar sejajar)
            const maxWidth = pageWidth / 2 - marginX - labelWidth; // sisa lebar kolom kiri setelah label

            // Pisahkan alamat menjadi beberapa baris sesuai lebar
            const alamatLines = doc.splitTextToSize(alamatTujuan, maxWidth);

            const leftColumn = [
                `Tanggal Kirim  : ${formatDate(header.shipment_date)}`,
                `Tujuan             : ${header.store_order.store.name}`,
            ];

            // Cetak kolom kiri biasa
            let leftY = y;
            leftColumn.forEach((text) => {
                doc.text(text, marginX, leftY);
                leftY += 5;
            });

            // Cetak alamat dengan wrap rapi
            const alamatLabel = 'Alamat             : ';
            doc.text(alamatLabel, marginX, leftY); // label
            const alamatX = marginX + labelWidth - 5; // posisi mulai isi alamat
            doc.text(alamatLines, alamatX, leftY, { maxWidth }); // isi multi-line alamat
            leftY += alamatLines.length * 5;

            // Cetak kolom kanan
            let rightY = y;
            rightColumn.forEach((text) => {
                doc.text(text, colRightX, rightY);
                rightY += 5;
            });

            // Set posisi Y paling bawah (supaya tabel mulai di bawah teks terpanjang)
            y = Math.max(leftY, rightY) + 6;

            // === TABEL BARANG ===
            const totalQty = details.reduce((sum, i) => sum + i.quantity, 0);
            autoTable(doc, {
                startY: y,
                head: [['No', 'Kode', 'Nama Barang', 'Qty', 'Satuan']],
                body: details.map((v, i) => [
                    i + 1,
                    v.product_code,
                    v.product_name,
                    v.quantity,
                    v.unit_name,
                ]),
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [66, 66, 66],
                    textColor: [255, 255, 255],
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 10 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 115 },
                    3: { halign: 'center', cellWidth: 15 },
                    4: { halign: 'center', cellWidth: 20 },
                },
                theme: 'grid',
                margin: { left: marginX, right: marginX },
                tableWidth: 'auto',
            });

            let finalY = (doc as any).lastAutoTable.finalY + 8;

            // === TOTAL QTY ===
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Qty: ${totalQty}`, marginX, finalY);
            finalY += 10;

            // === AREA TANDA TANGAN ===
            const colW = pageWidth / 3;
            const roles = ['Pengirim', 'Supir', 'Penerima'];
            roles.forEach((role, idx) => {
                const x = marginX + colW * idx + colW / 2 - 10;
                doc.text(role, x, finalY, { align: 'center' });
                doc.text('(___________________)', x, finalY + 20, { align: 'center' });
            });

            // === FOOTER ===
            finalY += 35;
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.text(
                'Dokumen ini dicetak otomatis dan sah.', //tanpa tanda tangan basah
                marginX,
                finalY,
            );
            doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, marginX, finalY + 5);

            message.destroy();
            message.success('Surat Jalan berhasil dibuat');

            // === TAMPILKAN PDF DI TAB BARU ===
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
        } catch (err) {
            message.destroy();
            message.error('Gagal mencetak Surat Jalan');
            console.error(err);
        }
    }, []);

    return <PrintButton onClick={mutate} />;
};

export default SuratJalanPrinter;
