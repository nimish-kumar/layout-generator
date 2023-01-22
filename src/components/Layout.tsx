import { Col, Divider, Row, Typography } from 'antd';
import React from 'react';
import { generateRowGroupName } from '../utils';

type BoxType = 'aisle' | 'seat';

export const SeatStatusCode = {
  sold: 0,
  available: 1,
  selected: 2,
} as const;
type SeatStatus = keyof typeof SeatStatusCode;

interface IExtensibleBoxProps<T extends BoxType> {
  type: T;
}

interface IBlankBoxProps {
  onClick?: null;
}
interface ISeatProps {
  seatNumber: string;
  status: SeatStatus;
  onClick: (e: React.MouseEvent) => void;
}

type IExtendedBlankBoxProps = IExtensibleBoxProps<'aisle'> & IBlankBoxProps;
type IExtendedSeatProps = IExtensibleBoxProps<'seat'> & ISeatProps;

type BoxProps = IExtendedBlankBoxProps | IExtendedSeatProps;

const combineStyles = (styles: React.CSSProperties[]) => {
  let r = {};
  for (let i = 0; i < styles.length; i++) {
    r = { ...r, ...styles[i] };
  }
  return r;
};
type aisleStyleParams = IExtensibleBoxProps<'aisle'>;
type seatStyleParams = IExtensibleBoxProps<'seat'> & Pick<ISeatProps, 'status'>;
type styleParams = aisleStyleParams | seatStyleParams;
function isSeat(param: styleParams) {
  if (typeof param === 'object' && 'status' in param) {
    return true;
  }
  return false;
}
const Box = (props: BoxProps) => {
  const availableSeatStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    color: '#1EA38C',
    border: '1px solid #1EA38C',
    fontSize: '0.625rem',
  };
  const soldSeatStyle: React.CSSProperties = {
    backgroundColor: '#EEEEEE',
  };
  const selectedSeatStyle: React.CSSProperties = {
    backgroundColor: '#1EA38C',
    color: '#FFF',
    fontSize: '0.625rem',
  };

  const seatStyle = (param: styleParams) => {
    if (isSeat(param)) {
      if (param.type === 'seat') {
        if (param.status === 'available') {
          return availableSeatStyle;
        }
        if (param.status === 'selected') {
          return selectedSeatStyle;
        }
        if (param.status === 'sold') {
          return soldSeatStyle;
        }
      }
      return {};
    } else {
      return {};
    }
  };
  return (
    <div
      style={combineStyles([
        {
          height: '1.5625rem',
          width: '1.5625rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        seatStyle(props),
      ])}
    >
      {`${props.type === 'aisle' ? '' : props.seatNumber}`}
    </div>
  );
};

interface IProps {
  fromIndex: number;
  toIndex: number;
}

export default function Layout({ fromIndex, toIndex }: IProps) {
  const { Text } = Typography;

  const rowGenerator = (fromIndex: number, toIndex: number) => {
    const rows = [];
    for (let i = fromIndex; i >= toIndex; i--) {
      rows.push(
        <Row gutter={[9, 9]} key={i} align='middle'>
          <Text
            type='secondary'
            style={{
              fontSize: '1rem',
              marginTop: '0.5rem',
              height: '1.5625rem',
              width: '1.5625rem',
            }}
          >
            {generateRowGroupName(i)}
          </Text>
          {Array.from({ length: 3 }, (_, index) => (
            <Box type='aisle' key={index} />
          ))}
          {Array.from({ length: 30 }, (_, index) => (
            <Col key={index}>
              <Box
                type='seat'
                onClick={() => console.log('Hello there')}
                status='available'
                seatNumber={`${index + 1}`}
              />
            </Col>
          )).reverse()}
        </Row>,
      );
    }
    return rows;
  };
  return (
    <Row style={{ marginBottom: '1.25rem' }}>
      <Text type='secondary' style={{ alignSelf: 'flex-start' }}>
        Row A
      </Text>
      <Divider style={{ marginTop: '.625rem', marginBottom: '.3125rem' }} />
      <Row>
        <Col>{rowGenerator(fromIndex, toIndex)}</Col>
      </Row>
    </Row>
  );
}
