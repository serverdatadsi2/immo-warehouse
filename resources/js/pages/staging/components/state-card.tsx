import { Card } from 'antd';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        positive: boolean;
    };
}

export const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => {
    return (
        <Card className="p-6 !bg-gray-200">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-foreground">{value}</h3>
                    {trend && (
                        <p
                            className={`text-sm mt-2 ${trend.positive ? 'text-success' : 'text-destructive'}`}
                        >
                            {trend.positive ? '↑' : '↓'} {trend.value}
                        </p>
                    )}
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
        </Card>
    );
};
