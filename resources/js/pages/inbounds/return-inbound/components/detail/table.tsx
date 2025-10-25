import { AddButton } from '@/components/buttons/crud-buttons';
import { DateDisplay } from '@/components/displays/date-display';
import { LaravelTable } from '@/components/tables/laravel-table';
import { usePermission } from '@/hooks/use-permission';
import { appendQueryString } from '@/lib/utils';
import { ExclamationCircleFilled, IssuesCloseOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import type { TableProps } from 'antd';
import { Button, Card, message, Modal, Space, Tag, Typography } from 'antd';
import { useCallback, useContext, useMemo, useState } from 'react';
import { DetailContext, DetailItem } from '../../detail';
import { DetailForm } from './form';

const { Title } = Typography;

export function DetailTable() {
    const { hasPermission } = usePermission();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<DetailItem>();

    const { detailsPagination: pagination, header, storeReturnId } = useContext(DetailContext);

    // const handleAction = useCallback((d: DetailItem) => {
    //     router.delete(`/inbounds/return-store/detail/${d.id}`, {
    //         onError: () => {
    //             message.error('Delete Detail Gagal');
    //         },
    //         onSuccess: () => {
    //             message.success('Delete Detail Success');
    //         },
    //         // onStart: () => {
    //         //     setProcessing(true);
    //         // },
    //     });
    // }, []);

    const columns = useMemo(
        (): TableProps<DetailItem>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                align: 'center',
                render: (_: any, __: DetailItem, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Nama Produk',
                dataIndex: 'product_name',
                key: 'product_name',
                align: 'left',
            },
            {
                title: 'RFID Tag',
                dataIndex: 'rfid_tag_id',
                key: 'rfid_tag_id',
                align: 'center',
                render: (qty) => (
                    <Tag color="blue" style={{ fontWeight: 'bold' }}>
                        {qty}
                    </Tag>
                ),
            },
            {
                title: 'Expired Date',
                dataIndex: 'expired_date',
                key: 'expired_date',
                align: 'center',
                render: (v) => <DateDisplay val={v} />,
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                align: 'center',
                render: (status) => {
                    let color = 'default';
                    const text = status?.toUpperCase() ?? '-';

                    switch (status) {
                        case 'match':
                            color = 'green';
                            break;
                        case 'missing':
                            color = 'red';
                            break;
                        case 'extra':
                            color = 'orange';
                            break;
                        default:
                            color = 'default';
                            break;
                    }

                    return <Tag color={color}>{text}</Tag>;
                },
            },

            // {
            //     title: 'Aksi',
            //     key: 'action',
            //     fixed: 'right',
            //     align: 'center',
            //     render: (_, v) => <DeleteButton onClick={() => handleAction(v)} />,
            // },
        ],
        [pagination?.current_page, pagination?.per_page],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    const handleAdd = useCallback(() => {
        setFormOpen(true);
    }, []);

    const handleFormClose = useCallback(() => {
        setFormOpen(false);
        setSelectedData(undefined);
    }, []);

    const handleCompare = useCallback(() => {
        if (!storeReturnId || !header?.id) {
            message.warning('Data tidak lengkap. Pastikan Store Return dan Inbound sudah dipilih.');
            return;
        }

        router.post(
            '/inbounds/return-store/compare-return',
            {
                store_return_id: storeReturnId,
                warehouse_inbound_id: header.id,
            },
            {
                onSuccess: () => message.success('Compare return berhasil!'),
                onError: () => message.error('Terjadi kesalahan saat compare return.'),
                // onFinish: () => {
                //     console.log('Compare request finished.');
                // },
            },
        );
    }, [storeReturnId, header?.id]);

    const showCompareConfirm = useCallback(() => {
        Modal.confirm({
            title: 'Konfirmasi Compare Data',
            icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
            content: (
                <>
                    <p>Proses ini hanya boleh dilakukan jika semua detail sudah di masukkan.</p>
                    <p>Apakah Anda yakin ingin melanjutkan?</p>
                </>
            ),
            okText: 'Ya, Lanjutkan',
            cancelText: 'Batal',
            okType: 'primary',
            centered: true,
            onOk() {
                handleCompare();
            },
        });
    }, [handleCompare]);

    return (
        <>
            <Card
                style={{
                    background: '#fff7e6',
                    boxShadow: '0 2px 8px #fffbe6',
                }}
            >
                <div className="flex justify-between">
                    <Title level={5} style={{ color: '#1890ff', marginBottom: 16 }}>
                        Detail Barang Inbound
                    </Title>
                    {hasPermission('inbound.return.write') && (
                        <AddButton disabled={!header} onClick={handleAdd}>
                            Tambah Detail Barang
                        </AddButton>
                    )}
                </div>
                <Space direction="vertical" className="w-full">
                    <LaravelTable<DetailItem>
                        rowKey="item_id"
                        columns={columns}
                        onPageChange={handlePageChange}
                        pagination={pagination}
                        // summary={() => (
                        //     <>
                        //         <Table.Summary.Row>
                        //             <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                        //             <Table.Summary.Cell index={4}>
                        //                 <b>Total Item</b>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={5}>
                        //                 <Tag color="blue">{header?.quantity_item}</Tag>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={6}></Table.Summary.Cell>
                        //         </Table.Summary.Row>
                        //         <Table.Summary.Row>
                        //             <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                        //             <Table.Summary.Cell index={4}>
                        //                 <b>Grand Total</b>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={5}>
                        //                 <Tag color="gold">{header?.grand_total}</Tag>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={6}></Table.Summary.Cell>
                        //         </Table.Summary.Row>
                        //     </>
                        // )}
                    />
                    {hasPermission('inbound.return.write') && (
                        <Button
                            onClick={showCompareConfirm}
                            icon={<IssuesCloseOutlined />}
                            type="primary"
                            style={{ backgroundColor: '#3f6600' }}
                        >
                            Done and Compare return
                        </Button>
                    )}
                </Space>
            </Card>
            <DetailForm onClose={handleFormClose} open={formOpen} existingData={selectedData} />
        </>
    );
}
