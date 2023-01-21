import { Col, Divider, Row, Typography } from 'antd';
import React from 'react';

const Box = () => {
  return <div style={{ height: '1.5625rem', width: '1.5625rem', backgroundColor: 'black' }} />;
};

export default function Layout() {
  const { Text } = Typography;
  return (
    <Row style={{ marginBottom: '1.25rem' }}>
      <Text type='secondary' style={{ alignSelf: 'flex-start' }}>
        Row A
      </Text>
      <Divider style={{ marginTop: '.625rem', marginBottom: '.3125rem' }} />
      <Row>
        <Col>
          <Row gutter={[9, 9]}>
            {Array.from({ length: 30 }, (_, index) => (
              <Col key={index}>
                <Box />
              </Col>
            ))}
          </Row>
          <Row gutter={[9, 9]} style={{ marginTop: '0.5rem' }}>
            {Array.from({ length: 24 }, (_, index) => (
              <Col key={index}>
                <Box />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Row>
  );
}
