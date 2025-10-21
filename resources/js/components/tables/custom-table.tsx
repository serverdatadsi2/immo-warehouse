import { Space, Table, TableProps } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import CustomPagination from './custom-pagination';

export interface CustomTableProps<T> extends TableProps<T> {
    page: number;
    onPaginationChange: (val: number) => void;
    paginationSize?: SizeType;
}

function CustomTable<T>({
    onPaginationChange,
    page = 1,
    paginationSize,
    ...tableProps
}: CustomTableProps<T>) {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Table<T> {...tableProps} pagination={false} />
            <CustomPagination
                dataLength={tableProps.dataSource?.length ?? 0}
                page={page}
                onChange={onPaginationChange}
                paginationSize={paginationSize}
            />
        </Space>
    );
}

export default CustomTable;
