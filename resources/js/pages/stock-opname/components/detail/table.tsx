import CustomTable from '@/components/tables/custom-table';
import { appendQueryString } from '@/lib/utils';
import { Product } from '@/types/product.type';
import { router } from '@inertiajs/react';
import { Button, Tooltip, type TableProps } from 'antd';
import { LayoutList } from 'lucide-react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { DetailContext, DetailItem } from '../../monitoring';
import DetailModal from './modal-detail';

export function DetailTable() {
    const { detailsPagination: pagination } = useContext(DetailContext);
    const [visible, setVisible] = useState<boolean>(false);
    const [product, setProduct] = useState<Partial<Product>>();

    const handleAction = useCallback((d) => {
        setProduct({ id: d.product_id, name: d.product_name, code: d.product_code });
        setVisible(true);
    }, []);

    const columns = useMemo(
        (): TableProps<DetailItem>['columns'] => [
            {
                title: 'No.',
                key: 'serial',
                render: (_: any, __: DetailItem, index: number) => {
                    const currentPage = pagination?.current_page ?? 1;
                    const perPage = pagination?.per_page ?? 10;
                    return (currentPage - 1) * perPage + index + 1;
                },
            },
            {
                title: 'Product',
                dataIndex: 'product_name',
                key: 'product_name',
            },
            {
                title: 'Pending',
                dataIndex: 'pending_qty',
                key: 'pending_qty',
            },
            {
                title: 'System',
                dataIndex: 'system_qty',
                key: 'system_qty',
            },
            {
                title: 'Match',
                dataIndex: 'match_qty',
                key: 'match_qty',
            },
            {
                title: 'Missing',
                dataIndex: 'missing_qty',
                key: 'missing_qty',
            },
            {
                title: 'Extra',
                dataIndex: 'extra_qty',
                key: 'extra_qty',
            },
            {
                title: 'Varian',
                dataIndex: 'varian',
                key: 'varian',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
            },
            {
                title: 'Action',
                dataIndex: 'product_id',
                key: 'product_id',
                fixed: 'right',
                align: 'center',
                render: (_, d) => (
                    <Tooltip title="Lihat Detail">
                        <Button
                            onClick={() => handleAction(d)}
                            icon={<LayoutList size={18} />}
                            type="primary"
                            style={{ borderRadius: 8, fontWeight: 'bold' }}
                        />
                    </Tooltip>
                ),
            },
        ],
        [handleAction, pagination],
    );

    const handlePageChange = useCallback((page: number) => {
        router.get(appendQueryString('page', String(page)));
    }, []);

    return (
        <>
            <CustomTable<DetailItem>
                size="small"
                rowKey="product_id"
                columns={columns}
                bordered
                dataSource={pagination?.data}
                onPaginationChange={handlePageChange}
                page={pagination?.current_page || 1}
                className="max-w-full"
                scroll={{ x: 'max-content' }}
            />
            <DetailModal open={visible} onClose={() => setVisible(false)} product={product} />
        </>
    );
}
