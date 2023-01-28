import { Col, Divider, Row, Typography } from 'antd';
import React, { PropsWithChildren, useState } from 'react';
import {
  generateRowGroupName,
  getImmediateSeat,
  getRows,
  getSeatNumber,
  getUpdatedRow,
  hasRowStarted,
  isAisle,
} from '../utils';

type BoxType = 'aisle' | 'seat';
type LayoutModes = 'creation' | 'selection';
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
            cursor: props.onClick ? 'pointer' : 'default',
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

interface IProps {
  fromIndex: number;
  toIndex: number;
}
interface ISeatRowHeaderProps {
  grpName: string;
}
const SeatRowHeader: React.FC<PropsWithChildren<ISeatRowHeaderProps>> = ({ grpName, children }) => {
  const { Text } = Typography;
  return (
    <Row>
      <Col>
        <Row justify='start'>
          <Text type='secondary'>{grpName}</Text>
          <Divider style={{ margin: '0.5rem 0' }} />
        </Row>
        {children}
      </Col>
    </Row>
  );
};

const SeatRow = ({
  rowHead,
  grpCode,
  gapCount = 2,
  reverse = false,
}: {
  rowHead: string;
  grpCode: string;
  gapCount?: number;
  reverse?: boolean;
}) => {
  const { Text } = Typography;
  const seatsArray =
    '4D&F16+16:4D&F15+15:BB0+0:BB0+0:4D&F12+14:4D&F16+13:4D&F15+12:BB0+0:BB0+0:4D&F12+11'.split(
      ':',
    );

  const initialAisleGap = Array(Math.floor(gapCount)).fill('BB0+0');
  const initialRowArray = [...initialAisleGap, ...seatsArray];
  const [row, setRow] = useState<string[]>(initialRowArray);
  const shiftAndUpdateRows = (
    index: number,
    grp: string = grpCode,
    reverse_order: boolean = reverse,
  ) => {
    const shiftedRows = getUpdatedRow(
      [...row.slice(gapCount)],
      index - gapCount,
      grp,
      rowHead,
      reverse_order,
    );
    setRow([...initialAisleGap, ...shiftedRows]);
  };

  return (
    <Row gutter={[9, 0]} align='middle' style={{ marginTop: '0.5rem' }}>
      <Text
        type='secondary'
        style={{
          fontSize: '0.8rem',
          height: '1.7rem',
          width: '3rem',
          marginRight: '1rem',
        }}
      >
        {rowHead}
      </Text>
      {row.map((e, index) => {
        if (isAisle(e)) {
          return (
            <>
              <Col>
                <Box
                  mode='creation'
                  type='aisle'
                  onClick={() =>
                    index >= gapCount ? shiftAndUpdateRows(index, 'BB', reverse) : null
                  }
                />
              </Col>
              {index + 1 === gapCount ? (
                <Col>
                  <Divider style={{ border: '0.025px solid grey' }} type='vertical' />
                </Col>
              ) : null}
            </>
          );
        } else {
          return (
            <Col key={index}>
              <Box
                mode='creation'
                type='seat'
                onClick={() => shiftAndUpdateRows(index, 'BB', reverse)}
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
  const rowString =
    '1:F:BB000:BB0+0:BB0+0:4D&F16+16:4D&F15+15:BB0+0:BB0+0:4D&F12+14:4D&F16+13:4D&F15+12:BB0+0:BB0+0:4D&F12+11|2:F:BB000:BB0+0:BB0+0:4D&F16+16:4D&F15+15:BB0+0:BB0+0:4D&F12+13|';
  const rowDetails = getRows(rowString)
    .map((row) => hasRowStarted(row))
    .filter((n) => n !== null)
    .sort((e) => (e?.grpRowIndex !== undefined ? -e.grpRowIndex : 0));
  return (
    <SeatRowHeader grpName='SOME GRP NAME'>
      <SeatRow gapCount={2} rowHead='F' grpCode='BB' reverse key='F' />
      <SeatRow gapCount={2} rowHead='H' grpCode='BB' reverse key='H' />
    </SeatRowHeader>
  );
}
