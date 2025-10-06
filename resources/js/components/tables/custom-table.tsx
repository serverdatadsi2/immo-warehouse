import { Space, Table, TableProps } from 'antd';
import CustomPagination from './custom-pagination';

export interface CustomTableProps<T> extends TableProps<T> {
    page: number;
    onPaginationChange: (val: number) => void;
}

function CustomTable<T>({ onPaginationChange, page = 1, ...tableProps }: CustomTableProps<T>) {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Table<T> {...tableProps} pagination={false} />
            <CustomPagination
                dataLength={tableProps.dataSource?.length ?? 0}
                page={page}
                onChange={onPaginationChange}
            />
        </Space>
    );
}

export default CustomTable;
