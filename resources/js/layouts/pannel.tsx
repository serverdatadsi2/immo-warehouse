import { Col, Row } from 'antd';
import React from 'react';

interface Props {
    leftPanel: React.ReactNode;
    rightPannel: React.ReactNode;
}
export function Pannel({ leftPanel, rightPannel }: Props) {
    return (
        <Row gutter={30}>
            <Col span={12}>{leftPanel}</Col>
            <Col span={12}>{rightPannel}</Col>
        </Row>
    );
}
