import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import React from 'react';

interface CustomPaginationProps {
    dataLength: number;
    page: number;
    onChange: (val: number) => void;
    paginationSize?: SizeType;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
    dataLength = 0,
    page = 0,
    onChange,
    paginationSize,
}) => {
    const limit = 10;

    return (
        <div className="flex justify-end">
            <Space align="end">
                <Button
                    size={paginationSize ?? 'middle'}
                    icon={<LeftOutlined />}
                    onClick={() => onChange(page - 1)}
                    disabled={page === 1}
                />
                <Button
                    size={paginationSize ?? 'middle'}
                    style={{ border: '1px solid #C9C9C9', color: 'black' }}
                    className="cursor-default text-black"
                >
                    {page}
                </Button>
                <Button
                    size={paginationSize ?? 'middle'}
                    icon={<RightOutlined />}
                    onClick={() => onChange(page + 1)}
                    disabled={dataLength !== limit}
                />
            </Space>
        </div>
    );
};

export default CustomPagination;
