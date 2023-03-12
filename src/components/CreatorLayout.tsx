import { Button, Row } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  IGrpDetails,
  IRowDetails,
  extractGroupsDetails,
  getUpdatedRow,
  hasRowStarted,
  immutableInsertArray,
  prependSeatRow,
  split,
} from '../utils';
import SeatRow, { SeatRowHeader } from './SeatRow';

export interface ICreatorLayoutProps {
  layout: string;
  gap: number;
  setLayout: React.Dispatch<React.SetStateAction<string>>;
  nextStep: () => void;
}
const CreatorLayout = ({ layout, gap, setLayout, nextStep }: ICreatorLayoutProps) => {
  const [grps, rows] = layout.split('||');
  const rendered = useRef(false);
  const rowsArray = split(rows)
    .map((row) => hasRowStarted(row))
    .sort((a, b) => (a?.grpRowIndex ?? 0) - (b?.grpRowIndex ?? 0))
    .filter((n) => !!n) as Array<IRowDetails>;
  const grpsArray = split(grps)
    .map((grp) => extractGroupsDetails(grp))
    .sort((a, b) => (a?.grpOrder ?? 0) - (b?.grpOrder ?? 0))
    .filter((x) => !!x) as Array<IGrpDetails>;
  console.log('Groups array', grpsArray);
  const updatedGrpsWithRows = grpsArray.map((g) => {
    const grpCode = g.grpCode;
    const rows = rowsArray.filter((r) => r.seatGrpCode === grpCode);
    g['rows'] = [...rows];
    return g;
  });
  console.log('Updated grps with rows', updatedGrpsWithRows);
  const [theatreGrps, setTheatreGrps] = useState<IGrpDetails[]>(updatedGrpsWithRows);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (rendered.current && submitted) {
      nextStep();
    }
  }, [submitted]);
  return (
    <>
      <Row gutter={[9, 9]} justify='center'>
        {theatreGrps.map((grp, grpIndex) => {
          const rows = grp.rows;
          return (
            <SeatRowHeader grpName={grp.grpName} cost={grp.cost} key={grpIndex}>
              {rows.map((row, rowIndex) => {
                const seatsArray = [...row.seatsString.split(':').slice(gap)];
                const initialAisleGap = Array(gap).fill(`${row.seatGrpCode}0+0`);
                const initialRowArray = [...initialAisleGap, ...seatsArray];
                // Shifts and updates rows if a seat is converted to aisle or vice versa
                const shiftAndUpdateRows = (seatIndex: number, reverse_order = true) => {
                  const updatedRow = getUpdatedRow(
                    [...initialRowArray.slice(gap)],
                    seatIndex - gap,
                    row.seatGrpCode,
                    row.rowHead,
                    'creation',
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
                    layoutMode='creation'
                    gapCount={gap}
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
          onClick={() => {
            let rowLayout = '';
            for (let i = 0; i < theatreGrps.length; i++) {
              for (let j = 0; j < theatreGrps[i].rows.length; j++) {
                rowLayout = rowLayout + theatreGrps[i].rows[j].inputString;
                if (
                  i !== theatreGrps.length - 1 ||
                  j !== theatreGrps[i].rows.length - 1
                ) {
                  rowLayout = `${rowLayout}|`;
                }
              }
            }
            setLayout(`${grps}||${rowLayout}`);
            rendered.current = true;
            setSubmitted(true);
          }}
        >
          Submit
        </Button>
      </Row>
    </>
  );
};

export default CreatorLayout;
