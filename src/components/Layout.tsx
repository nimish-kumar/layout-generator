import { Button, Col, Divider, Form, Row, Typography } from 'antd';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import {
  IGrpDetails,
  IRowDetails,
  convertCodeToNumber,
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
  const initialAisleGap = Array(Math.floor(gapCount)).fill(`${grpCode}0+0`);
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
                  onClick={() => {
                    if (index >= gapCount) {
                      shiftAndUpdateRows(index, grpCode, reverse);
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
                onClick={() => shiftAndUpdateRows(index, grpCode, reverse)}
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
  // const layout =
  //   'PREMIUM:A:500:INR:1:N|NORMAL:B:400:INR:2:N|GAREEB:C:50:INR:3:N||1:K:A000:A0+0:A0+0:1A&K1+30:1A&K2+29:1A&K3+28:1A&K4+27:1A&K5+26:1A&K6+25:1A&K7+24:1A&K8+23:1A&K9+22:1A&K10+21:1A&K11+20:1A&K12+19:1A&K13+18:1A&K14+17:1A&K15+16:1A&K16+15:1A&K17+14:1A&K18+13:1A&K19+12:1A&K20+11:1A&K21+10:1A&K22+9:1A&K23+8:1A&K24+7:1A&K25+6:1A&K26+5:1A&K27+4:1A&K28+3:1A&K29+2:1A&K30+1|2:J:A000:A0+0:A0+0:1A&J1+30:1A&J2+29:1A&J3+28:1A&J4+27:1A&J5+26:1A&J6+25:1A&J7+24:1A&J8+23:1A&J9+22:1A&J10+21:1A&J11+20:1A&J12+19:1A&J13+18:1A&J14+17:1A&J15+16:1A&J16+15:1A&J17+14:1A&J18+13:1A&J19+12:1A&J20+11:1A&J21+10:1A&J22+9:1A&J23+8:1A&J24+7:1A&J25+6:1A&J26+5:1A&J27+4:1A&J28+3:1A&J29+2:1A&J30+1|3:I:A000:A0+0:A0+0:1A&I1+30:1A&I2+29:1A&I3+28:1A&I4+27:1A&I5+26:1A&I6+25:1A&I7+24:1A&I8+23:1A&I9+22:1A&I10+21:1A&I11+20:1A&I12+19:1A&I13+18:1A&I14+17:1A&I15+16:1A&I16+15:1A&I17+14:1A&I18+13:1A&I19+12:1A&I20+11:1A&I21+10:1A&I22+9:1A&I23+8:1A&I24+7:1A&I25+6:1A&I26+5:1A&I27+4:1A&I28+3:1A&I29+2:1A&I30+1|4:H:A000:A0+0:A0+0:1A&H1+30:1A&H2+29:1A&H3+28:1A&H4+27:1A&H5+26:1A&H6+25:1A&H7+24:1A&H8+23:1A&H9+22:1A&H10+21:1A&H11+20:1A&H12+19:1A&H13+18:1A&H14+17:1A&H15+16:1A&H16+15:1A&H17+14:1A&H18+13:1A&H19+12:1A&H20+11:1A&H21+10:1A&H22+9:1A&H23+8:1A&H24+7:1A&H25+6:1A&H26+5:1A&H27+4:1A&H28+3:1A&H29+2:1A&H30+1|1:G:B000:B0+0:B0+0:1B&G1+30:1B&G2+29:1B&G3+28:1B&G4+27:1B&G5+26:1B&G6+25:1B&G7+24:1B&G8+23:1B&G9+22:1B&G10+21:1B&G11+20:1B&G12+19:1B&G13+18:1B&G14+17:1B&G15+16:1B&G16+15:1B&G17+14:1B&G18+13:1B&G19+12:1B&G20+11:1B&G21+10:1B&G22+9:1B&G23+8:1B&G24+7:1B&G25+6:1B&G26+5:1B&G27+4:1B&G28+3:1B&G29+2:1B&G30+1|2:F:B000:B0+0:B0+0:1B&F1+30:1B&F2+29:1B&F3+28:1B&F4+27:1B&F5+26:1B&F6+25:1B&F7+24:1B&F8+23:1B&F9+22:1B&F10+21:1B&F11+20:1B&F12+19:1B&F13+18:1B&F14+17:1B&F15+16:1B&F16+15:1B&F17+14:1B&F18+13:1B&F19+12:1B&F20+11:1B&F21+10:1B&F22+9:1B&F23+8:1B&F24+7:1B&F25+6:1B&F26+5:1B&F27+4:1B&F28+3:1B&F29+2:1B&F30+1|3:E:B000:B0+0:B0+0:1B&E1+30:1B&E2+29:1B&E3+28:1B&E4+27:1B&E5+26:1B&E6+25:1B&E7+24:1B&E8+23:1B&E9+22:1B&E10+21:1B&E11+20:1B&E12+19:1B&E13+18:1B&E14+17:1B&E15+16:1B&E16+15:1B&E17+14:1B&E18+13:1B&E19+12:1B&E20+11:1B&E21+10:1B&E22+9:1B&E23+8:1B&E24+7:1B&E25+6:1B&E26+5:1B&E27+4:1B&E28+3:1B&E29+2:1B&E30+1|4:D:B000:B0+0:B0+0:1B&D1+30:1B&D2+29:1B&D3+28:1B&D4+27:1B&D5+26:1B&D6+25:1B&D7+24:1B&D8+23:1B&D9+22:1B&D10+21:1B&D11+20:1B&D12+19:1B&D13+18:1B&D14+17:1B&D15+16:1B&D16+15:1B&D17+14:1B&D18+13:1B&D19+12:1B&D20+11:1B&D21+10:1B&D22+9:1B&D23+8:1B&D24+7:1B&D25+6:1B&D26+5:1B&D27+4:1B&D28+3:1B&D29+2:1B&D30+1|5:C:B000:B0+0:B0+0:1B&C1+30:1B&C2+29:1B&C3+28:1B&C4+27:1B&C5+26:1B&C6+25:1B&C7+24:1B&C8+23:1B&C9+22:1B&C10+21:1B&C11+20:1B&C12+19:1B&C13+18:1B&C14+17:1B&C15+16:1B&C16+15:1B&C17+14:1B&C18+13:1B&C19+12:1B&C20+11:1B&C21+10:1B&C22+9:1B&C23+8:1B&C24+7:1B&C25+6:1B&C26+5:1B&C27+4:1B&C28+3:1B&C29+2:1B&C30+1|1:B:C000:C0+0:C0+0:1C&B1+30:1C&B2+29:1C&B3+28:1C&B4+27:1C&B5+26:1C&B6+25:1C&B7+24:1C&B8+23:1C&B9+22:1C&B10+21:1C&B11+20:1C&B12+19:1C&B13+18:1C&B14+17:1C&B15+16:1C&B16+15:1C&B17+14:1C&B18+13:1C&B19+12:1C&B20+11:1C&B21+10:1C&B22+9:1C&B23+8:1C&B24+7:1C&B25+6:1C&B26+5:1C&B27+4:1C&B28+3:1C&B29+2:1C&B30+1|2:A:C000:C0+0:C0+0:1C&A1+30:1C&A2+29:1C&A3+28:1C&A4+27:1C&A5+26:1C&A6+25:1C&A7+24:1C&A8+23:1C&A9+22:1C&A10+21:1C&A11+20:1C&A12+19:1C&A13+18:1C&A14+17:1C&A15+16:1C&A16+15:1C&A17+14:1C&A18+13:1C&A19+12:1C&A20+11:1C&A21+10:1C&A22+9:1C&A23+8:1C&A24+7:1C&A25+6:1C&A26+5:1C&A27+4:1C&A28+3:1C&A29+2:1C&A30+1';

  const [grps, rows] = layout.split('||');
  const rowsArray = split(rows)
    .map((row) => hasRowStarted(row))
    .sort((a, b) => (a?.grpRowIndex ?? 0) - (b?.grpRowIndex ?? 0))
    .filter((n) => !!n) as Array<IRowDetails>;
  const [theatreRows, setTheatreRows] = useState<IRowDetails[]>(rowsArray);
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
    <>
      <Row gutter={[9, 9]} justify='center'>
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
      <Row justify='center' style={{ marginTop: '2rem' }}>
        <Button type='primary' onSubmit={() => null}>
          Submit
        </Button>
      </Row>
    </>
  );
}
