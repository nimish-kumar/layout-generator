import React from 'react';
import './App.css';
import 'antd/dist/reset.css';
import LayoutGenerator from './components/LayoutGeneratorForm';
import Layout from './components/Layout';
import { Row } from 'antd';

function App() {
  return (
    <div className='App'>
      <LayoutGenerator />
      <Row>
        <Layout />
      </Row>
    </div>
  );
}

export default App;
