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
    data: {
        date: string;
        count: number;
        type: string;
    }[];
}

export default function ChartTrend({ data }: Props) {
    const types = Array.from(new Set(data.map((d) => d.type)));

    const colors = ['#faad14', '#13c2c2'];
    return (
        <Card>
            <Card.Meta title="Inbound / Outbound Trend (Weekly)" />
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend verticalAlign="top" />
                        {types.map((type, index) => (
                            <Line
                                key={type}
                                type="monotone"
                                dataKey="count"
                                data={data.filter((d) => d.type === type)}
                                name={type}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
