import { DeleteButton } from '@/components/buttons/common-buttons';
import { BackButton } from '@/components/buttons/crud-buttons';
import { MoneyDisplay } from '@/components/displays/money-display';
import { FormItem } from '@/components/forms/form-item';
import { MoneyInput } from '@/components/inputs/money-input';
import { CoaAsyncSelect } from '@/components/selects/coa-async-select';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { AppLayout } from '@/layouts/app-layout';
import { Journal, JournalDetail } from '@/types/journal.type';
import { SalesInvoice } from '@/types/sales-invoice.type';
import { Head } from '@inertiajs/react';
import { Button, Col, DatePicker, Form, Input, message, Row, Space, Tooltip } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Minus, Plus, SendHorizontal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export default function Page({ transactionNumber, existingData }: PageProps) {
    // const [form] = Form.useForm<FormType>();
    const { form, processing, post, destroy } = useAntdInertiaForm<FormType>('Purchase');
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [messageApi, contextHolder] = message.useMessage();

    const handleSave = useCallback(async () => {
        if (totalDebit !== totalCredit) {
            messageApi.error('Journal not balance!');
            return;
        }
        const val = await form.validateFields();
        post({
            url: '/purchases/manual-input',
            data: { ...val, date: val.date?.format('YYYY-MM-DD') },
            onSuccess: () => {
                messageApi.success('Success save purchase journal');
                form.resetFields();
                setTotalDebit(0);
                setTotalCredit(0);
            },
        });
    }, [form, messageApi, post, totalCredit, totalDebit]);

    const handleFormValuesChange = useCallback((v: FormType, r: FormType) => {
        if (v.journal_details) {
            const debit = r.journal_details?.reduce((a, i) => a + (i.debit ?? 0), 0);
            const credit = r.journal_details?.reduce((a, i) => a + (i.credit ?? 0), 0);
            setTotalDebit(debit ?? 0);
            setTotalCredit(credit ?? 0);
        }
    }, []);

    const handleDelete = useCallback(() => {
        destroy({ url: `/purchases/manual-input/${existingData?.id}` });
    }, [destroy, existingData?.id]);

    useHotkeys(
        'ctrl+enter',
        () => {
            handleSave();
        },
        { enableOnFormTags: true },
    );

    useHotkeys(
        'enter',
        () => {
            const details: JournalDetailForm[] = form.getFieldValue('journal_details');
            details.push({ debit: 0, credit: 0 });
            form.setFieldValue('journal_details', details);
        },
        { enableOnFormTags: true },
    );

    useHotkeys(
        'escape',
        () => {
            const details: JournalDetailForm[] = form.getFieldValue('journal_details');
            details.pop();
            form.setFieldValue('journal_details', details);
        },
        { enableOnFormTags: true },
    );

    useEffect(() => {
        if (transactionNumber) {
            form.setFieldsValue({ transaction_number: transactionNumber });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionNumber]);

    useEffect(() => {
        if (existingData) {
            const details = existingData.journal_details.map((d) => ({
                ...d,
                debit: Number(d.debit),
                credit: Number(d.credit),
            }));
            form.setFieldsValue({
                ...existingData,
                date: dayjs(existingData.date),
                journal_details: details,
            });
            const debit = details.reduce((a, i) => a + (i.debit ?? 0), 0);
            const credit = details.reduce((a, i) => a + (i.credit ?? 0), 0);
            setTotalDebit(debit ?? 0);
            setTotalCredit(credit ?? 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingData]);

    return (
        <AppLayout
            navBarTitle="Purchase Inv Manual Input"
            navBarLeft={<BackButton backUrl="/purchases" />}
        >
            {contextHolder}
            <Head title="Input Pembelian" />
            <Form
                initialValues={{ journal_details: [{ debit: 0, credit: 0 }] }}
                form={form}
                autoComplete="off"
                layout="vertical"
                onValuesChange={handleFormValuesChange}
            >
                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <FormItem
                            label="Transaction Number"
                            required
                            name="transaction_number"
                            rules={[{ required: true, message: 'Please input transaction number' }]}
                        >
                            <Input />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            label="Date"
                            required
                            name="date"
                            rules={[{ required: true, message: 'Please input date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </FormItem>
                    </Col>
                </Row>
                <Form.List name="journal_details">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} style={{ marginBottom: 8 }} gutter={[8, 4]}>
                                    <Col span={6}>
                                        <Form.Item
                                            noStyle
                                            {...restField}
                                            name={[name, 'coa_id']}
                                            rules={[
                                                { required: true, message: 'Please input COA' },
                                            ]}
                                        >
                                            <CoaAsyncSelect />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            noStyle
                                            {...restField}
                                            name={[name, 'description']}
                                            rules={[
                                                { required: true, message: 'Please description' },
                                            ]}
                                        >
                                            <Input placeholder="Description" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={5}>
                                        <Form.Item
                                            noStyle
                                            {...restField}
                                            name={[name, 'debit']}
                                            rules={[
                                                { required: true, message: 'Please input debit' },
                                            ]}
                                        >
                                            <MoneyInput placeholder="Debit" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={5}>
                                        <Form.Item
                                            noStyle
                                            {...restField}
                                            name={[name, 'credit']}
                                            rules={[
                                                { required: true, message: 'Please input credit' },
                                            ]}
                                        >
                                            <MoneyInput placeholder="Credit" />
                                        </Form.Item>
                                    </Col>
                                    <Col>
                                        <Button
                                            danger
                                            icon={<Minus size={16} />}
                                            onClick={() => remove(name)}
                                        />
                                    </Col>
                                </Row>
                            ))}
                            <Form.Item>
                                <Row gutter={8}>
                                    <Col offset={12} span={5}>
                                        <div style={{ paddingLeft: '0.6rem' }}>
                                            <MoneyDisplay val={totalDebit} />
                                        </div>
                                    </Col>
                                    <Col span={5}>
                                        <div style={{ paddingLeft: '0.6rem' }}>
                                            <MoneyDisplay val={totalCredit} />
                                        </div>
                                    </Col>
                                </Row>
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add({ debit: 0, credit: 0 })}
                                    block
                                    icon={<Plus size={16} />}
                                >
                                    Add Item
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item>
                    <Space>
                        <DeleteButton onClick={handleDelete} disabled={!existingData} />
                        <Tooltip title="(ctrl+enter)">
                            <Button
                                type="primary"
                                disabled={processing}
                                onClick={handleSave}
                                icon={<SendHorizontal size={16} />}
                            >
                                Submit
                            </Button>
                        </Tooltip>
                    </Space>
                </Form.Item>
            </Form>
        </AppLayout>
    );
}

export type HeaderItem = SalesInvoice;

type ExistingData = Journal & { journal_details: JournalDetail[] };

type PageProps = {
    transactionNumber: string;
    existingData: ExistingData | null;
};

type JournalDetailForm = Partial<
    Omit<JournalDetail, 'debit' | 'credit'> & {
        debit: number;
        credit: number;
    }
>;

type FormType = Partial<
    Omit<Journal, 'date'> & {
        date: Dayjs;
        journal_details: Array<JournalDetailForm>;
    }
>;
