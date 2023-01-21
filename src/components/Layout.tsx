import { Col, Divider, Row, Typography } from 'antd';
import React from 'react';

type BoxType = 'aisle' | 'seat';
type SeatStatus = 'sold' | 'available' | 'selected';

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
          console.log('AVAILABLE :>> ');
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
  console.log('combine styles', seatStyle(props));
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
          {Array.from({ length: 5 }, (_, outerIndex) => (
            <Row gutter={[9, 9]} key={outerIndex} align='middle'>
              <Text type='secondary' style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
                P
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
            </Row>
          ))}
        </Col>
      </Row>
    </Row>
  );
}
