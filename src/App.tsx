import React, { ReactNode, useState } from 'react';
import './App.css';
import 'antd/dist/reset.css';
import LayoutGenerator from './components/LayoutGeneratorForm';
import Layout from './components/Layout';
import { Col, Row, Typography } from 'antd';
import Stepper from './components/Stepper';

function App() {
  const { Title } = Typography;
  const [activeStep, setStep] = useState(0);
  const [layout, setLayout] = useState('');
  const nextStep = () => {
    setStep((step) => step + 1);
  };
  const steps = [
    {
      title: 'Layout form',
      content: <LayoutGenerator setLayout={setLayout} nextStep={nextStep} />,
    },
    { title: 'Design layout', content: <Layout layout={layout} setLayout={setLayout} /> },
  ];
  return (
    <div className='App'>
      <Row gutter={[8, 2]} justify='center'>
        <Col span={24}>
          <Title level={3}>Layout generator form</Title>
        </Col>
        <Col span={2}>
          <Stepper activeStep={activeStep} steps={steps} />
        </Col>
        <Col span={16}>{steps[activeStep].content}</Col>
      </Row>
    </div>
  );
}

export default App;
