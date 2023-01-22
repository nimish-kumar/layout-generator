import React from 'react';
import './App.css';
import 'antd/dist/reset.css';
import LayoutGenerator from './components/LayoutGeneratorForm';
import Layout from './components/Layout';
import { Col, Row } from 'antd';

function App() {
  return (
    <div className='App'>
      <LayoutGenerator />
      <Row justify='center'>
        <Col>
          <Layout fromIndex={10} toIndex={5} />
        </Col>
      </Row>
    </div>
  );
}

export default App;
