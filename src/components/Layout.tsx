import { Button, Col, Divider, Row, Typography } from 'antd';
import React, { PropsWithChildren, useState } from 'react';
import {
  IGrpDetails,
  IRowDetails,
  extractGroupsDetails,
  getSeatNumber,
  getUpdatedRow,
  hasRowStarted,
  immutableInsertArray,
  isAisle,
  prependSeatRow,
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
            // cursor: props.onClick ? 'pointer' : 'default',
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
      <Row justify='center'>
        <Col span={24}>{children}</Col>
      </Row>
    </Col>
  );
};

const SeatRow = ({
  rowHead,
  grpCode,
  rowString,
  updateRowLayout,
  gapCount = 2,
  reverse = false,
}: {
  rowHead: string;
  grpCode: string;
  rowString: string;
  updateRowLayout: (seatIndex: number, reverse_order: boolean) => void;
  gapCount?: number;
  reverse?: boolean;
}) => {
  const { Text } = Typography;
  const seatsArray = [...rowString.split(':').slice(gapCount)];
  const initialAisleGap = Array(Math.floor(gapCount)).fill(`${grpCode}0+0`);
  const row = [...initialAisleGap, ...seatsArray];
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
                  onClick={() => {
                    if (index >= gapCount) {
                      updateRowLayout(index, reverse);
                    }
                  }}
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
                onClick={() => updateRowLayout(index, reverse)}
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

export interface ILayoutProps {
  layout: string;
  setLayout: React.Dispatch<React.SetStateAction<string>>;
}

export default function Layout({ layout, setLayout }: ILayoutProps) {
  const [grps, rows] = layout.split('||');
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
  const [theatreGrps, setTheatreGrps] = useState<IGrpDetails[]>(updatedGrpsWithRows);
  return (
    <>
      <Row gutter={[9, 9]} justify='center'>
        {theatreGrps.map((grp, grpIndex) => {
          const rows = grp.rows;
          return (
            <SeatRowHeader grpName={grp.grpName} cost={grp.cost} key={grpIndex}>
              {rows.map((row, rowIndex) => {
                const gap = 2;
                const seatsArray = [...row.seatsString.split(':').slice(gap)];
                const initialAisleGap = Array(gap).fill(`${row.seatGrpCode}0+0`);
                const initialRowArray = [...initialAisleGap, ...seatsArray];
                const shiftAndUpdateRows = (seatIndex: number, reverse_order = true) => {
                  const updatedRow = getUpdatedRow(
                    [...initialRowArray.slice(gap)],
                    seatIndex - gap,
                    row.seatGrpCode,
                    row.rowHead,
                    reverse_order,
                  ).join(':');
                  const updatedRowDetails = hasRowStarted(
                    prependSeatRow(row.grpRowIndex, row.rowHead, row.seatGrpCode, gap, updatedRow),
                  );
                  if (updatedRowDetails === null) {
                    throw 'Error 404: Error while parsing updated row';
                  }
                  setTheatreGrps(
                    immutableInsertArray(theatreGrps, grpIndex, {
                      ...theatreGrps[grpIndex],
                      rows: immutableInsertArray(
                        theatreGrps[grpIndex].rows,
                        rowIndex,
                        updatedRowDetails,
                      ),
                    }),
                  );
                };
                return (
                  <SeatRow
                    rowHead={row.rowHead}
                    grpCode={row.seatGrpCode}
                    rowString={row.seatsString}
                    reverse
                    key={rowIndex}
                    updateRowLayout={shiftAndUpdateRows}
                  />
                );
              })}
            </SeatRowHeader>
          );
        })}
      </Row>
      <Row justify='center' style={{ marginTop: '2rem' }}>
        <Button
          type='primary'
          onSubmit={() => {
            let rowLayout = '';
            for (let i = 0; i < updatedGrpsWithRows.length; i++) {
              for (let j = 0; j < updatedGrpsWithRows[i].rows.length; j++) {
                rowLayout = rowLayout + updatedGrpsWithRows[i].rows[j].inputString;
              }
            }
            setLayout(`${grps}||${rowLayout}`);
          }}
        >
          Submit
        </Button>
      </Row>
    </>
  );
}
