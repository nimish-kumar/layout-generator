import { Col, Divider, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { generateRowGroupName, getImmediateSeat, getSeatNumber, getUpdatedRow } from '../utils';

type BoxType = 'aisle' | 'seat';
type LayoutModes = 'creation' | 'selection';
export const SeatStatusCode = {
  sold: 0,
  available: 1,
  selected: 2,
} as const;
type SeatStatus = keyof typeof SeatStatusCode;

interface IExtensibleBoxProps<T extends BoxType> {
  type: T;
  mode: LayoutModes;
}

interface IBlankBoxProps {
  onClick?: () => void;
}
interface ISeatProps {
  seatNumber: string;
  status: SeatStatus;
  onClick: () => void;
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
function isSelectionModeActive(param: styleParams) {
  if (param.mode === 'selection') {
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
  const creationModeAisleStyle: React.CSSProperties = {
    backgroundColor: '#DC3558',
    color: '#FFF',
    fontSize: '0.625rem',
  };
  const creationModeSeatStyle: React.CSSProperties = {
    backgroundColor: '#1EA38C',
    color: '#FFF',
    fontSize: '0.625rem',
    fontWeight: 'bold',
  };
  const seatStyle = (param: styleParams) => {
    if (isSelectionModeActive(param)) {
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
      }
      return {};
    } else {
      if (isSeat(param)) {
        return creationModeSeatStyle;
      }
      return creationModeAisleStyle;
    }
  };
  if (props.type === 'aisle') {
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
        onClick={props.onClick}
      >
        {' '}
      </div>
    );
  }
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
      onClick={props.onClick}
    >
      {props.seatNumber}
    </div>
  );
};

interface IProps {
  fromIndex: number;
  toIndex: number;
}

const SeatRow = ({
  rowIndex,
  maxSeats,
  grpIndex,
  grpName,
  gapCount = 2,
  reverse = false,
}: {
  rowIndex: number;
  maxSeats: number;
  grpIndex: number;
  grpName: string;
  gapCount?: number;
  reverse?: boolean;
}) => {
  const seatsNumber = Math.floor(maxSeats);
  const { Text } = Typography;
  let seatsArray = Array(seatsNumber)
    .fill('seat')
    .map((v, i) => `${i + 1}-${v}`);

  const initialAisleGap = Array(Math.floor(gapCount)).fill('aisle');
  if (reverse) {
    seatsArray = seatsArray.reverse();
  }
  const initialRowArray = [...initialAisleGap, ...seatsArray];
  const [row, setRow] = useState<string[]>(initialRowArray);

  useEffect(() => {
    console.log('Updated row------>   ', row);
  }, [row]);
  return (
    <Row gutter={[9, 9]} align='middle'>
      <Text
        type='secondary'
        style={{
          fontSize: '0.8rem',
          marginTop: '0.5rem',
          height: '1.7rem',
          width: '1.7rem',
        }}
      >
        {generateRowGroupName(rowIndex)}
      </Text>

      {row.map((e, index) => {
        if (e === 'aisle') {
          return (
            <>
              <Col key={index}>
                <Box
                  mode='creation'
                  type='aisle'
                  onClick={() => {
                    const immediateIndex = getImmediateSeat(row, index);
                    console.log('Immediate seat idx', immediateIndex);
                    return index + 1 > gapCount
                      ? setRow([
                          ...row.slice(0, index),
                          `${immediateIndex + 1}-seat`,
                          ...row.slice(index + 1),
                        ])
                      : null;
                  }}
                />
              </Col>
              {index + 1 === gapCount ? <Divider type='vertical' /> : null}
            </>
          );
        } else {
          return (
            <Col key={index}>
              <Box
                mode='creation'
                type='seat'
                onClick={() => {
                  console.log('Clicked on', row[index]);
                  const shiftedRows = getUpdatedRow(
                    [...row.slice(gapCount)],
                    index - gapCount,
                    reverse,
                  );
                  setRow([...initialAisleGap, ...shiftedRows]);
                }}
                status='available'
                seatNumber={`${getSeatNumber(row[index])}`}
              />
            </Col>
          );
        }
      })}
    </Row>
  );
};

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
              fontSize: '0.8rem',
              marginTop: '0.5rem',
              height: '1.7rem',
              width: '1.7rem',
            }}
          >
            {generateRowGroupName(i)}
          </Text>

          {Array.from({ length: 2 }, (_, index) => (
            <Col key={index}>
              <Box mode='creation' type='aisle' />
            </Col>
          ))}
          {Array.from({ length: 30 }, (_, index) => (
            <Col key={index}>
              <Box
                mode='creation'
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
      <Row justify='center' align='middle' style={{ padding: '0.5rem' }}>
        <Col>
          <SeatRow gapCount={2} maxSeats={30} grpName='B' grpIndex={30} rowIndex={12} />
          {/* <SeatRow gapCount={2} maxSeats={30} grpName='B' rowHead='AA' rowIndex={31} />
          <SeatRow gapCount={2} maxSeats={30} grpName='B' rowHead='AA' rowIndex={31} />
          <SeatRow gapCount={2} maxSeats={30} grpName='B' rowHead='AA' rowIndex={31} /> */}
        </Col>
      </Row>
    </Row>
  );
}
