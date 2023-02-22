import { Row, Typography } from 'antd';
import React from 'react';
import SelectionLayout from './SelectionLayout';

interface IResultPageProps {
  layout: string;
  gap: number;
}

const ResultPage = ({ layout, gap }: IResultPageProps) => {
  const { Paragraph } = Typography;
  return (
    <Row justify='center'>
      <Paragraph copyable>{layout}</Paragraph>
      <SelectionLayout layout={layout} gap={gap} />
    </Row>
  );
};

export default ResultPage;
