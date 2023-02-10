import React, { useState } from 'react';
import { Row } from 'antd';
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

export interface ISelectionLayoutProps {
  layout: string;
  gap: number;
}

export default function SelectionLayout({ layout, gap = 2 }: ISelectionLayoutProps) {
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
    <Row gutter={[9, 9]} justify='center'>
      {theatreGrps.map((grp, grpIndex) => {
        const rows = grp.rows;
        return (
          <SeatRowHeader grpName={grp.grpName} cost={grp.cost} key={grpIndex}>
            {rows.map((row, rowIndex) => {
              const seatsArray = [...row.seatsString.split(':').slice(gap)];
              const initialAisleGap = Array(gap).fill(`${row.seatGrpCode}0+0`);
              const initialRowArray = [...initialAisleGap, ...seatsArray];
              const seatSelectHandler = (seatIndex: number, reverse_order = true) => {
                const updatedRow = getUpdatedRow(
                  [...initialRowArray.slice(gap)],
                  seatIndex - gap,
                  row.seatGrpCode,
                  row.rowHead,
                  'selection',
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
                  gapCount={gap}
                  reverse
                  key={rowIndex}
                  layoutMode='selection'
                  updateRowLayout={seatSelectHandler}
                />
              );
            })}
          </SeatRowHeader>
        );
      })}
    </Row>
  );
}
