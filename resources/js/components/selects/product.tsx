import { useDebounce } from '@/hooks/use-debounce';
import axiosIns from '@/lib/axios';
import { OptionSelect } from '@/types/option.type';
import { Product } from '@/types/product.type';
import { useQuery } from '@tanstack/react-query';
import { Button, Divider, Select, SelectProps, Space } from 'antd';
import { useEffect, useState } from 'react';

export function ProductAsyncSelect(props: Props) {
    const [search, setSearch] = useState<string>();
    const [options, setOptions] = useState<OptionSelect[]>([]);
    const [page, setPage] = useState<number>(1);

    const { data, isLoading } = useQuery({
        queryKey: ['Product', search],
        queryFn: async () => {
            const res = await axiosIns.get<Array<Product>>('/api/products', {
                params: { search, page },
            });
            return res.data.map((d) => ({
                value: d.id,
                label: `${d.code} - ${d.name}`,
            }));
        },
    });

    useEffect(() => {
        if (data) {
            if (page === 1) {
                setOptions(data);
            } else {
                setOptions((prev) => [...prev, ...data]);
            }
        }
    }, [page, data]);

    const debouncedSearch = useDebounce((val: string) => {
        setSearch(val);
        setPage(1);
        setOptions([]);
    }, 300);

    return (
        <Select
            {...props}
            showSearch
            defaultActiveFirstOption={false}
            filterOption={false}
            onSearch={debouncedSearch}
            options={options}
            placeholder="Search Product"
            loading={isLoading}
            style={{ width: '100%' }}
            dropdownRender={(menu) => (
                <>
                    {menu}
                    {data?.length === 30 && (
                        <>
                            <Divider style={{ margin: '8px 0' }} />
                            <Space style={{ padding: '0 8px 4px' }}>
                                <Button type="link" onClick={() => setPage((prev) => prev + 1)}>
                                    Load more
                                </Button>
                            </Space>
                        </>
                    )}
                </>
            )}
        />
    );
}

type Props = Omit<
    SelectProps,
    'showSearch' | 'loading' | 'filterOption' | 'onSearch' | 'options' | 'style' | 'dropdownRender'
>;
