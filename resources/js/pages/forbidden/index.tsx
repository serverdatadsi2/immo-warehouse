import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button, Card, Result } from 'antd';

export default function ForbiddenPage() {
    return (
        <AppLayout navBarTitle="Akses Ditolak">
            <Head title="Forbidden" />
            <div className="flex justify-center items-center">
                <Card
                    style={{
                        maxWidth: 600,
                        width: '100%',
                    }}
                >
                    <Result
                        status="403"
                        title="403"
                        subTitle="Sorry, you are not authorized to access this page."
                        extra={
                            <Link href="/" key="home">
                                <Button type="primary">Back Home</Button>
                            </Link>
                        }
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
