import axiosIns from '@/lib/axios';
import { Product } from '@/types/product.type';
import { CloseOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal, Table, Tooltip } from 'antd';
import { useContext } from 'react';
import { DetailContext } from '../../monitoring';

interface Props {
    onClose: () => void;
    open: boolean;
    product: Partial<Product> | undefined;
}
export default function DetailModal({ onClose, open, product }: Props) {
    const { header } = useContext(DetailContext);

    const { data, isLoading } = useQuery({
        queryKey: ['stock-opname-detail', product?.id, header?.id],
        queryFn: async () => {
            const res = await axiosIns.get<Array<any>>(
                `/stock-opname/detail?headerId=${header?.id}&productId=${product?.id}`,
            );

            return res.data;
        },
        enabled: Boolean(product?.id) && Boolean(header?.id),
    });

    return (
        <Modal
            loading={isLoading}
            title={`${product?.code} - ${product?.name}`}
            className="!w-1/2"
            // centered
            closeIcon={
                <Tooltip title="(esc)">
                    <CloseOutlined />
                </Tooltip>
            }
            open={open}
            onCancel={onClose}
            footer={
                <Button type="primary" onClick={onClose}>
                    OK
                </Button>
            }
        >
            <Table
                size="small"
                columns={[
                    {
                        title: 'No.',
                        dataIndex: 'no',
                        key: 'no',
                    },
                    {
                        title: 'Missing Items',
                        dataIndex: 'rfid_missing',
                        key: 'rfid_missing',
                    },
                    {
                        title: 'Extra Items',
                        dataIndex: 'rfid_extra',
                        key: 'rfid_extra',
                    },
                ]}
                pagination={false}
                dataSource={data}
                bordered
                rowKey="no"
            />
        </Modal>
    );
}
