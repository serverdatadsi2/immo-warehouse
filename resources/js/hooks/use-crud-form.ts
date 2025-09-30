import { useSystemMessage } from '@/components/messages/message-provider';
import { router } from '@inertiajs/react';
import { Form } from 'antd';
import { useCallback, useEffect, useState } from 'react';

export function useCrudForm<FormType, Item>({ url, onSuccess, name, existingData }: Params<Item>) {
    const [form] = Form.useForm<FormType>();
    const [errors, setErrors] = useState<Partial<Record<keyof FormType, string>>>();
    const showMessage = useSystemMessage();

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue() as any;
        if (existingData) {
            router.put(`${url}/${existingData.id}`, formValues, {
                onSuccess: () => {
                    setErrors(undefined);
                    showMessage({ action: 'update', model: name, status: 'success' });
                    form.resetFields();
                    onSuccess?.();
                },
                onError: (e) => {
                    setErrors(e as any);
                    showMessage({ action: 'update', model: name, status: 'error' });
                },
            });
        } else {
            router.post(url, formValues, {
                onSuccess: () => {
                    setErrors(undefined);
                    showMessage({ action: 'create', model: name, status: 'success' });
                    form.resetFields();
                    onSuccess?.();
                },
                onError: (e) => {
                    setErrors(e as any);
                    showMessage({ action: 'create', model: name, status: 'error' });
                },
            });
        }
    }, [existingData, form, name, onSuccess, showMessage, url]);

    const handleDelete = useCallback(() => {
        if (existingData) {
            router.delete(`${url}/${existingData.id}`, {
                onSuccess: () => {
                    setErrors(undefined);
                    showMessage({ action: 'delete', model: name, status: 'success' });
                    form.resetFields();
                    onSuccess?.();
                },
                onError: (e) => {
                    setErrors(e as any);
                    showMessage({ action: 'delete', model: name, status: 'error' });
                },
            });
        }
    }, [existingData, name, onSuccess, showMessage, url, form]);

    useEffect(() => {
        if (existingData) {
            form.setFieldsValue(existingData as any);
        }
    }, [existingData, form]);

    return { handleSave, errors, form, handleDelete, setErrors };
}

type Params<Item> = {
    url: string;
    onSuccess?: () => void;
    name: string;
    existingData: (Omit<Item, 'id'> & { id: number }) | undefined;
};
