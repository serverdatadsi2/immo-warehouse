import { Form, FormItemProps } from 'antd';

export function FormItem({ errorMessage, ...props }: Props) {
    return <Form.Item validateStatus={errorMessage ? 'error' : undefined} help={errorMessage} {...props} />;
}

type Props = FormItemProps & {
    errorMessage?: string;
};
