import { useDebounce } from '@/hooks/use-debounce';
import axiosIns from '@/lib/axios';
import { Location } from '@/types/location-suggestion.type';
import { OptionSelect } from '@/types/option.type';
import { useQuery } from '@tanstack/react-query';
import { Button, Divider, Select, SelectProps, Space } from 'antd';
import { useEffect, useState } from 'react';

type LocationSelectProps = Omit<
    SelectProps,
    | 'showSearch'
    | 'loading'
    | 'filterOption'
    | 'onSearch'
    | 'options'
    | 'style'
    | 'popupRender'
    | 'disabled'
> & {
    type?: 'room' | 'rack' | 'layer';
    parentId?: string;
};

export function LocationSelect({
    type,
    parentId,
    placeholder = 'Pilih Location',
    ...props
}: LocationSelectProps) {
    const [search, setSearch] = useState<string>();
    const [options, setOptions] = useState<OptionSelect[]>([]);
    const [page, setPage] = useState<number>(1);

    const { data, isLoading } = useQuery({
        queryKey: ['Location', type, parentId, search, page],
        queryFn: async () => {
            const res = await axiosIns.get<Array<Location>>('/api/locations', {
                params: {
                    type,
                    parent_id: parentId,
                    search,
                    page,
                },
            });
            return res.data.map((d) => ({
                value: d.id,
                label: `${d.code} - ${d.name}`,
            }));
        },
        enabled: !type || !parentId || !!parentId,
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
            placeholder={placeholder}
            loading={isLoading}
            style={{ width: '100%' }}
            disabled={!type || (type !== 'room' && !parentId)}
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
