import { LaravelPagination } from '@/types/laravel-pagination.type';
import { Pagination, Space, Table, TableProps } from 'antd';

export function LaravelTable<T>({ pagination, onPageChange, hidePagination, ...props }: Props<T>) {
    return (
        <Space direction="vertical" className="w-full">
            <Table
                {...props}
                size="small"
                bordered
                dataSource={pagination?.data ?? []}
                pagination={false}
                scroll={{ x: 'max-content' }}
            />
            {pagination && !hidePagination && (
                <Pagination
                    align="end"
                    current={pagination.current_page}
                    pageSize={pagination.per_page}
                    total={pagination.total}
                    onChange={onPageChange}
                />
            )}
        </Space>
    );
}

type Props<T> = Omit<TableProps<T>, 'pagination'> & {
    pagination: LaravelPagination<T> | null;
    onPageChange: (page: number) => void;
    hidePagination?: boolean;
};
