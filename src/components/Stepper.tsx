import { StepProps, Steps } from 'antd';
import React from 'react';

interface IProps {
  activeStep: number;
  steps: StepProps[];
}

const Stepper = ({ activeStep, steps }: IProps) => {
  const percent = (activeStep / steps.length) * 100;
  return <Steps current={activeStep} percent={percent} items={steps} direction='vertical' />;
};

export default Stepper;
