import axiosIns from '@/lib/axios';
import { OptionSelect } from '@/types/option.type';
import { Product } from '@/types/product.type';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { AutoComplete, AutoCompleteProps, Input } from 'antd';
import { useEffect, useState } from 'react';

type Props = Omit<
    AutoCompleteProps<string>,
    'loading' | 'onSearch' | 'options' | 'style' | 'popupRender' | 'children'
> & {
    value?: string;
    onChange?: (value: string) => void;
};

export function ConditionAutoComplete(props: Props) {
    const [options, setOptions] = useState<OptionSelect[]>([]);

    const [inputValue, setInputValue] = useState<string>(props.value || '');

    const { data, isLoading } = useQuery({
        queryKey: ['all-conditions'],
        queryFn: async () => {
            const res = await axiosIns.get<Array<Product>>('/api/conditions');

            return res.data.map((d) => ({
                value: d.name,
                label: d.name,
            }));
        },
        staleTime: Infinity,
    });

    useEffect(() => {
        if (data) {
            setOptions(data);
        }
    }, [data]);

    const handleChange = (value: string) => {
        setInputValue(value);
        if (props.onChange) {
            props.onChange(value);
        }
    };

    const handleSearch = (value: string) => {
        setInputValue(value);
    };

    useEffect(() => {
        if (props.value !== undefined) {
            setInputValue(props.value);
        }
    }, [props.value]);

    return (
        <AutoComplete
            {...props}
            value={inputValue}
            onChange={handleChange}
            onSearch={handleSearch}
            options={options}
            placeholder="Pilih Kondisi atau Masukkan Nilai Baru"
            style={{ width: '100%' }}
        >
            <Input suffix={isLoading ? <LoadingOutlined /> : null} />
        </AutoComplete>
    );
}
