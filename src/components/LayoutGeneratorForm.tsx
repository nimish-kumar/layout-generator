import { Button, Col, Form, Input, InputNumber, Row, Space, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React from 'react';
import { generateLayout } from '../utils';

export interface IGrpData {
  col_count: number;
  group_cost: number;
  group_name: string;
  row_count: number;
}
export interface ISeatGroupsData {
  groups: IGrpData[];
}

interface ILayoutGeneratorProps {
  setLayout: React.Dispatch<React.SetStateAction<string>>;
  nextStep: () => void;
}
const LayoutGeneratorForm = ({ setLayout, nextStep }: ILayoutGeneratorProps) => {
  const [form] = Form.useForm();
  const initialFormValue: ISeatGroupsData = {
    groups: [],
  };

  const submitBtnHandler = (values: ISeatGroupsData) => {
    values.groups = [
      ...values.groups.map((grp) => ({
        ...grp,
        group_name: grp.group_name.toUpperCase().trimEnd(),
      })),
    ];
    setLayout(generateLayout(values));
    nextStep();
  };

  return (
    <Row justify='center'>
      <Col>
        <Form
          name='layout-generator'
          initialValues={initialFormValue}
          autoComplete='off'
          form={form}
          onFinish={submitBtnHandler}
        >
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
                            initialValue={30}
                            rules={[{ required: true, message: 'Enter column count' }]}
                          >
                            <InputNumber />
                          </Form.Item>
                          <Tooltip placement='right' title='Remove row'>
                            <MinusCircleOutlined
                              onClick={() => {
                                remove(name);
                              }}
                              disabled={false}
                              style={{ verticalAlign: 'middle' }}
                            />
                          </Tooltip>
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
};

export default LayoutGeneratorForm;
