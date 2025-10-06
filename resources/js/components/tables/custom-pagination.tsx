import { Button, Space } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface CustomPaginationProps {
    dataLength: number;
    page: number;
    onChange: (val: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
    dataLength = 0,
    page = 0,
    onChange,
}) => {
    const limit = 10;

    return (
        <div className="flex justify-end">
            <Space align="end">
                <Button
                    icon={<ChevronLeft />}
                    onClick={() => onChange(page - 1)}
                    disabled={page === 1}
                />
                <Button
                    style={{ border: '1px solid #C9C9C9', color: 'black' }}
                    className="cursor-default text-black"
                >
                    {page}
                </Button>
                <Button
                    icon={<ChevronRight />}
                    onClick={() => onChange(page + 1)}
                    disabled={dataLength !== limit}
                />
            </Space>
        </div>
    );
};

export default CustomPagination;
