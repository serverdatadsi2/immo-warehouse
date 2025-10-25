import { DeleteButton, SaveButton } from '@/components/buttons/common-buttons';
import { BackButton } from '@/components/buttons/crud-buttons';
import { FormItem } from '@/components/forms/form-item';
import { useAntdInertiaForm } from '@/hooks/use-antd-inertia-form';
import { usePermission } from '@/hooks/use-permission';
import { AppLayout } from '@/layouts/app-layout';
import { Permission } from '@/types/permission.type';
import { Role } from '@/types/role.type';
import { Head } from '@inertiajs/react';
import { Card, Checkbox, Col, Divider, Form, Input, List, message, Row, Typography } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';

const { Title, Text } = Typography;

interface Props {
    role?: Role;
    permissions: Permission[];
}

interface FormValues {
    name: string;
    permissions: string[];
}

export default function RoleForm({ role, permissions }: Props) {
    const { hasPermission, hasAnyPermission } = usePermission();
    const { form, errors, processing, post, destroy } = useAntdInertiaForm<FormValues>('Roles');

    const handleSave = useCallback(() => {
        const formValues = form.getFieldsValue();
        post({
            url: '/system/roles',
            data: { ...role, ...formValues },
            onSuccess: () => {
                message.success('Role and permissions saved successfully.');
            },
        });
    }, [form, post, role]);

    const handleDelete = useCallback(() => {
        destroy({
            url: `/system/roles/${role?.id}`,
            onSuccess: () => {
                message.success('Role and permissions delete successfully.');
            },
        });
    }, [destroy, role?.id]);

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        permissions.forEach((p) => {
            const [group] = p.name.split('.');
            if (!groups[group]) groups[group] = [];
            groups[group].push(p);
        });
        return groups;
    }, [permissions]);

    useEffect(() => {
        form.setFieldsValue({
            name: role?.name ?? '',
            permissions: role?.permissions.map((d) => d.name) ?? [],
        });
    }, [form, role?.name, role?.permissions]);

    return (
        <AppLayout
            navBarLeft={<BackButton backUrl="/system/roles" />}
            navBarTitle={`${role?.id ? 'Edit Role: ' + role.name : 'Create New Role'}`}
        >
            <Head title={role?.name ? 'Edit Role' : 'New Role'} />

            <Card
                style={{
                    background: '#f5faff',
                    boxShadow: '0 2px 8px #1890ff11',
                }}
            >
                <Form form={form} layout="vertical">
                    <FormItem
                        label="Role Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the role name!' }]}
                        errorMessage={errors?.name}
                    >
                        <Input placeholder="Enter role name (e.g. Super Admin)" />
                    </FormItem>

                    <div>
                        <Title level={5}>Permissions</Title>
                        <Text type="secondary">
                            Select the permissions that belong to this role.
                        </Text>

                        <Form.Item name="permissions" noStyle>
                            <Checkbox.Group style={{ width: '100%' }}>
                                <List
                                    size="small"
                                    style={{ width: '100%' }}
                                    dataSource={Object.entries(groupedPermissions)}
                                    renderItem={([group, perms], index) => (
                                        <List.Item
                                            className={`flex flex-col items-start px-0 py-3 rounded-md ${
                                                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                            }`}
                                        >
                                            <Row style={{ width: '100%' }}>
                                                <Col span={4}>
                                                    <span className="font-semibold text-blue-600 mb-2 capitalize">
                                                        {group.replace('_', ' ')}
                                                    </span>
                                                </Col>
                                                <Col span={20}>
                                                    <Row
                                                        gutter={[10, 10]}
                                                        style={{ width: '100%' }}
                                                    >
                                                        {perms.map((permission) => (
                                                            <Col key={permission.name} span={4}>
                                                                <Checkbox value={permission.name}>
                                                                    {permission.name
                                                                        .replace(`${group}.`, '')
                                                                        .replaceAll('_', ' ')}
                                                                </Checkbox>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </List.Item>
                                    )}
                                />
                            </Checkbox.Group>
                        </Form.Item>
                    </div>

                    <Divider />

                    <Row justify="end" gutter={20}>
                        {hasPermission('role.delete') && (
                            <Col>
                                <DeleteButton
                                    onClick={handleDelete}
                                    disabled={!role || processing}
                                />
                            </Col>
                        )}
                        {hasAnyPermission(['role.create', 'role.update']) && (
                            <Col>
                                <SaveButton onClick={handleSave} disabled={processing} />
                            </Col>
                        )}
                    </Row>
                </Form>
            </Card>
        </AppLayout>
    );
}
