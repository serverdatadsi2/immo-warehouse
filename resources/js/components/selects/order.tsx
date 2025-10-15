import { useDebounce } from '@/hooks/use-debounce';
import axiosIns from '@/lib/axios';
import { OptionSelect } from '@/types/option.type';
import { ReceivingOrder } from '@/types/receiving-order.type';
import { useQuery } from '@tanstack/react-query';
import { Button, Divider, Form, FormInstance, Select, SelectProps, Space } from 'antd';
import React, { useEffect, useState } from 'react';

export const OrderAsyncSelect = React.memo(function OrderAsyncSelect(props: Props) {
    const orderRf = Form.useWatch('order_ref', props.form);

    const [search, setSearch] = useState<string>();
    const [options, setOptions] = useState<OptionSelect[]>([]);
    const [page, setPage] = useState<number>(1);

    const { data, isLoading } = useQuery({
        queryKey: ['all-order-packing', search, page, orderRf || 'none'],
        queryFn: async () => {
            const res = await axiosIns.get<Array<ReceivingOrder>>(
                `/get-all/${orderRf}-packing-orders`,
                {
                    params: { search, page },
                },
            );
            return res.data.map((d) => ({
                value: d.id,
                label: d.order_number,
            }));
        },
        enabled: Boolean(orderRf),
    });

    useEffect(() => {
        if (data) {
            if (page === 1) {
                setOptions(data);
            } else {
                setOptions((prev) => [...prev, ...data]);
            }
        }
    }, [data, page]);

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
            placeholder="Search Number Order"
            loading={isLoading}
            style={{ width: '100%' }}
            onSelect={(_, options) => props.form.setFieldValue('order_number', options.label)}
            popupRender={(menu) => (
                <>
                    {menu}
                    {data?.length === 30 && (
                        <>
                            <Divider style={{ margin: '8px 0' }} />
                            <Space style={{ padding: '0 8px 4px' }}>
                                <Button type="link" onClick={() => setPage((prev) => prev + 1)}>
                                    Load more +
                                </Button>
                            </Space>
                        </>
                    )}
                </>
            )}
        />
    );
});

type Props = Omit<
    SelectProps,
    'showSearch' | 'loading' | 'filterOption' | 'onSearch' | 'options' | 'style' | 'popupRender'
> & {
    form: FormInstance;
};
