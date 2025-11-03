import { ChartType } from '@/types/dashboard.type';
import { Card } from 'antd';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Props {
    data: ChartType[];
}

export default function ChartTrend({ data }: Props) {
    return (
        <Card>
            <Card.Meta title="Inbound / Outbound Trend (Weekly)" />
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip wrapperClassName="rounded-lg" />
                        <Legend verticalAlign="top" />
                        <Line
                            type="monotone"
                            dataKey="inbound"
                            name="Inbound"
                            stroke="#faad14"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="outbound"
                            name="Outbound"
                            stroke="#13c2c2"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
