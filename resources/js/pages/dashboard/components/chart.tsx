import { Line } from '@ant-design/plots';
import { Card } from 'antd';

interface Props {
    data: any[];
}
export default function ChartTrend({ data }: Props) {
    // const trendData = [
    //     { date: '2025-10-14', type: 'Inbound', count: 120 },
    //     { date: '2025-10-14', type: 'Outbound', count: 85 },
    //     { date: '2025-10-15', type: 'Inbound', count: 160 },
    //     { date: '2025-10-15', type: 'Outbound', count: 100 },
    //     { date: '2025-10-16', type: 'Inbound', count: 90 },
    //     { date: '2025-10-16', type: 'Outbound', count: 150 },
    //     { date: '2025-10-17', type: 'Inbound', count: 130 },
    //     { date: '2025-10-17', type: 'Outbound', count: 110 },
    //     { date: '2025-10-18', type: 'Inbound', count: 170 },
    //     { date: '2025-10-18', type: 'Outbound', count: 145 },
    //     { date: '2025-10-19', type: 'Inbound', count: 210 },
    //     { date: '2025-10-19', type: 'Outbound', count: 180 },
    // ];

    const config = {
        data: data,
        xField: 'date',
        yField: 'count',
        seriesField: 'type',
        smooth: true,
        height: 300,
        width: 1150,
        shapeField: 'smooth',
        point: {
            size: 4,
            shape: 'circle',
        },
        colorField: 'type',
    };

    return (
        <Card>
            <Card.Meta title="Inbound / Outbound Trend (Weekly)" />
            <Line {...config} />
        </Card>
    );
}
