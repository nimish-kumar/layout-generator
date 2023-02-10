import { Col, Divider, Row, Typography } from 'antd';
import React, { PropsWithChildren } from 'react';
import { Prettify, getSeatDetails, getSeatNumber, isAisle } from '../utils';

type BoxType = 'aisle' | 'seat';
export type LayoutModes = 'creation' | 'selection';
export const SeatStatusCode = {
  sold: 0,
  available: 1,
  selected: 2,
} as const;
export type SeatStatus = keyof typeof SeatStatusCode;
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

type IExtendedBlankBoxProps = Prettify<IExtensibleBoxProps<'aisle'> & IBlankBoxProps>;
type IExtendedSeatProps = Prettify<IExtensibleBoxProps<'seat'> & ISeatProps>;

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
            cursor: props.onClick ? 'pointer' : 'default',
          },
          seatStyle(props),
        ])}
        onClick={props.onClick}
      />
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
          cursor: 'pointer',
        },
        seatStyle(props),
      ])}
      onClick={props.onClick}
    >
      {props.seatNumber}
    </div>
  );
};

interface ISeatRowHeaderProps {
  grpName: string;
  cost: number;
}
export const SeatRowHeader: React.FC<PropsWithChildren<ISeatRowHeaderProps>> = ({
  grpName,
  cost,
  children,
}) => {
  const { Text } = Typography;
  return (
    <Col span={24}>
      <Row justify='start'>
        <Text type='secondary'>{`${grpName} - Rs. ${cost}`}</Text>
        <Divider style={{ margin: '0.5rem 0' }} />
      </Row>
      <Row justify='center'>
        <Col span={24}>{children}</Col>
      </Row>
    </Col>
  );
};

interface ISeatRowProps {
  rowHead: string;
  grpCode: string;
  rowString: string;
  layoutMode: LayoutModes;
  gapCount: number;
  reverse: boolean;
  updateRowLayout: (seatIndex: number, reverse_order: boolean) => void;
}

const SeatRow = ({
  rowHead,
  grpCode,
  rowString,
  layoutMode,
  gapCount,
  reverse,
  updateRowLayout,
}: ISeatRowProps) => {
  const { Text } = Typography;

  const seatsArray = [...rowString.split(':').slice(gapCount)];
  const initialAisleGap = Array(Math.floor(gapCount)).fill(`${grpCode}0+0`) as string[];
  const row = [...initialAisleGap, ...seatsArray];

  const statuses = Object.keys(SeatStatusCode) as SeatStatus[];
  // Converts status code to status
  const getStatusFromStatusCode = (index: string) => statuses[parseInt(index, 10)];

  return (
    <Row gutter={[9, 0]} align='middle' style={{ marginTop: '0.5rem' }}>
      <Text
        type='secondary'
        style={{
          fontSize: '0.8rem',
          height: '1.7rem',
          width: '3rem',
        }}
      >
        {rowHead}
      </Text>
      {row.map((e, index) => {
        if (isAisle(e)) {
          return (
            <div
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
              key={index}
            >
              <Col>
                <Box
                  mode={layoutMode}
                  type='aisle'
                  onClick={() => {
                    if (index >= gapCount) {
                      updateRowLayout(index, reverse);
                    }
                  }}
                />
              </Col>
              {index + 1 === gapCount && layoutMode === 'creation' ? (
                <Col>
                  <Divider style={{ border: '0.025px solid grey' }} type='vertical' />
                </Col>
              ) : null}
            </div>
          );
        } else {
          return (
            <Col key={index}>
              <Box
                mode={layoutMode}
                type='seat'
                onClick={() => {
                  updateRowLayout(index, reverse);
                }}
                status={getStatusFromStatusCode(
                  getSeatDetails(e)?.seatStatusCode ?? `${statuses.indexOf('available')}`,
                )}
                seatNumber={`${getSeatNumber(row[index])}`}
              />
            </Col>
          );
        }
      })}
    </Row>
  );
};

export default SeatRow;
