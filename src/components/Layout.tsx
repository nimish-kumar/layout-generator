import { Col, Divider, Row, Typography } from 'antd';
import React, { PropsWithChildren, useState } from 'react';
import {
  IGrpDetails,
  IRowDetails,
  extractGroupsDetails,
  getSeatNumber,
  getUpdatedRow,
  hasRowStarted,
  isAisle,
  split,
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

interface ISeatRowHeaderProps {
  grpName: string;
  cost: number;
}
const SeatRowHeader: React.FC<PropsWithChildren<ISeatRowHeaderProps>> = ({
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
      {children}
    </Col>
  );
};

const SeatRow = ({
  rowHead,
  grpCode,
  rowString,
  gapCount = 2,
  reverse = false,
}: {
  rowHead: string;
  grpCode: string;
  rowString: string;
  gapCount?: number;
  reverse?: boolean;
}) => {
  const { Text } = Typography;
  const seatsArray = [...rowString.split(':').slice(gapCount)];
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
            </div>
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

export default function Layout() {
  const seatingPattern = `PREMIUM:BB:400:INR:1:N|NORMAL:B:500:INR:2:N||1:F:BB000:BB0+0:BB0+0:4D&F16+16:4D&F15+15:BB0+0:BB0+0:4D&F12+14:4D&F16+13:4D&F15+12:BB0+0:BB0+0:4D&F12+11|1:E:B000:B0+0:B0+0:4D&F16+15:4D&F15+14:B0+0:B0+0:4D&F12+13|`;
  const [grps, rows] = seatingPattern.split('||');
  const rowsArray = split(rows)
    .map((row) => hasRowStarted(row))
    .sort((a, b) => (a?.grpRowIndex ?? 0) - (b?.grpRowIndex ?? 0))
    .filter((n) => !!n) as Array<IRowDetails>;
  const grpsArray = split(grps)
    .map((grp) => extractGroupsDetails(grp))
    .sort((a, b) => (a?.grpOrder ?? 0) - (b?.grpOrder ?? 0))
    .filter((x) => !!x) as Array<IGrpDetails>;

  const updatedGrpsWithRows = grpsArray.map((g) => {
    const grpCode = g.grpCode;
    const rows = rowsArray.filter((r) => r.seatGrpCode === grpCode);
    g['rows'] = [...rows];
    return g;
  });
  return (
    <Row gutter={[9, 9]}>
      {updatedGrpsWithRows.map((grp, index) => {
        const rows = grp.rows;
        return (
          <SeatRowHeader grpName={grp.grpName} cost={grp.cost} key={index}>
            {rows.map((row, index) => {
              return (
                <SeatRow
                  rowHead={row.rowHead}
                  grpCode={row.seatGrpCode}
                  rowString={row.seatsString}
                  reverse
                  key={index}
                />
              );
            })}
          </SeatRowHeader>
        );
      })}
    </Row>
  );
}
