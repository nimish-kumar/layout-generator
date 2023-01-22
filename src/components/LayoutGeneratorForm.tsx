import { Button, Col, Form, Input, InputNumber, Row, Space, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React from 'react';

export interface IGrpData {
  rowGrp: number;
}
export interface ISeatGroupsData {
  groups: IGrpData[];
}

export default function LayoutGeneratorForm() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const initialFormValue = {
    groups: [],
  };
 
  const submitBtnHandler = (values: any) => {
    console.log('values :>> ', values);
  };

  return (
    <Row justify='center'>
      <Col span={24}>
        <Title level={3}>Layout generator form</Title>
      </Col>
      <Col>
        <Form
          name='layout-generator'
          initialValues={initialFormValue}
          autoComplete='off'
          form={form}
          onFinish={submitBtnHandler}
        >
          {/* <Col>
            <Space>
              <Form.Item>
              <Title level={5}>{`Rows`}</Title>
              </Form.Item>
            </Space>
          </Col> */}
          <Col>
            <Form.List name='groups'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restFields }) => (
                    <Row key={key} align='middle'>
                      <Col>
                        <Space align='baseline' size='large'>
                          <Form.Item
                            name={[name, 'group_name']}
                            label='Group name'
                            rules={[{ required: true, message: 'Enter group name' }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name={[name, 'group_cost']}
                            label='Ticket price'
                            rules={[{ required: true, message: 'Enter price' }]}
                          >
                            <InputNumber prefix='₹' />
                          </Form.Item>
                          <Form.Item
                            name={[name, 'row_count']}
                            label='Row count'
                            {...restFields}
                            initialValue={1}
                            rules={[{ required: true, message: 'Enter row count' }]}
                          >
                            <InputNumber />
                          </Form.Item>
                          <Form.Item
                            name={[name, 'col_count']}
                            label={`Col count`}
                            {...restFields}
                            initialValue={10}
                            rules={[{ required: true, message: 'Enter column count' }]}
                          >
                            <InputNumber />
                          </Form.Item>
                          <MinusCircleOutlined
                            onClick={() => {
                              remove(name);
                            }}
                            disabled={false}
                            style={{ verticalAlign: 'middle' }}
                          />
                        </Space>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type='dashed'
                      onClick={() => {
                        add();
                      }}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add row grp
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Col>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}
