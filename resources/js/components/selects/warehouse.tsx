import { useDebounce } from '@/hooks/use-debounce';
import axiosIns from '@/lib/axios';
import { OptionSelect } from '@/types/option.type';
import { Warehouse } from '@/types/warehouse.type';
import { useQuery } from '@tanstack/react-query';
import { Button, Divider, Select, SelectProps, Space } from 'antd';
import { useEffect, useState } from 'react';

export function WarehouseAsyncSelect(props: Props) {
    const [search, setSearch] = useState<string>();
    const [options, setOptions] = useState<OptionSelect[]>([]);
    const [page, setPage] = useState<number>(1);

    const { data = [], isLoading } = useQuery({
        queryKey: ['warehouses', search, page],
        queryFn: async () => {
            const res = await axiosIns.get<Array<Warehouse>>('/api/warehouses', {
                params: { search, page },
            });
            return res.data.map((d) => ({
                value: d.id,
                label: d.name,
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
            // suffixIcon={null}
            onSearch={debouncedSearch}
            options={options}
            placeholder="Search Gudang"
            loading={isLoading}
            style={{ width: '100%' }}
            popupRender={(menu) => (
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
    'showSearch' | 'loading' | 'filterOption' | 'onSearch' | 'options' | 'style' | 'popupRender'
>;
