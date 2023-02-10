import React, { useEffect, useState } from 'react';
import './App.css';
import 'antd/dist/reset.css';
import LayoutGenerator from './components/LayoutGeneratorForm';
import { Col, Row, Typography } from 'antd';
import Stepper from './components/Stepper';
import CreatorLayout from './components/CreatorLayout';
import ResultPage from './components/ResultPage';

function App() {
  const { Title } = Typography;
  const [activeStep, setStep] = useState(0);
  const [layout, setLayout] = useState('');
  const nextStep = () => {
    setStep((step) => step + 1);
  };
  useEffect(() => {
    console.log('Layout changed', layout);
  }, [layout]);
  const steps = [
    {
      title: 'Layout form',
      content: <LayoutGenerator setLayout={setLayout} nextStep={nextStep} />,
    },
    {
      title: 'Design layout',
      content: <CreatorLayout layout={layout} gap={2} setLayout={setLayout} nextStep={nextStep} />,
    },
    { title: 'Result layout', content: <ResultPage layout={layout} gap={2} /> },
  ];
  return (
    <div className='App'>
      <Row gutter={[8, 2]} justify='center'>
        <Col span={24}>
          <Title level={3}>Layout generator form</Title>
        </Col>
        <Col span={3}>
          <Stepper activeStep={activeStep} steps={steps} />
        </Col>
        <Col span={18}>{steps[activeStep].content}</Col>
      </Row>
    </div>
  );
}

export default App;
