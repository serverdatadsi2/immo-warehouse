import { useSystemMessage } from '@/components/messages/message-provider';
import { router } from '@inertiajs/react';
import { Form, message } from 'antd';
import { useCallback, useState } from 'react';

export function useAntdInertiaForm<T>(modelName: string) {
    const [form] = Form.useForm<T>();
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>();
    const [processing, setProcessing] = useState(false);
    const showMessge = useSystemMessage();

    const post = useCallback(
        ({ url, data, onSuccess }: PostParams) => {
            router.post(url, data, {
                onError: (e) => {
                    showMessge({ action: 'save', model: modelName, status: 'error' });
                    setErrors(e as any);
                },
                onSuccess: () => {
                    showMessge({ action: 'save', model: modelName, status: 'success' });
                    setErrors(undefined);
                    onSuccess?.();
                },
                onStart: () => {
                    setProcessing(true);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            });
        },
        [modelName, showMessge],
    );

    const destroy = useCallback(
        ({ url, onSuccess }: DestroyParams) => {
            router.delete(url, {
                onError: (e) => {
                    if (e.error) message.error(e.error);
                    else showMessge({ action: 'delete', model: modelName, status: 'error' });
                    setErrors(e as any);
                },
                onSuccess: () => {
                    showMessge({ action: 'delete', model: modelName, status: 'success' });
                    setErrors(undefined);
                    onSuccess?.();
                },
                onStart: () => {
                    setProcessing(true);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            });
        },
        [modelName, showMessge],
    );

    return { form, errors, setErrors, post, processing, destroy };
}

type PostParams = {
    url: string;
    data?: any;
    onSuccess?: () => void;
};

type DestroyParams = {
    url: string;
    onSuccess?: () => void;
};
