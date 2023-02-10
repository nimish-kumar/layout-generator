import { LayoutModes } from '../components/SeatRow';
import { SeatStatus, SeatStatusCode } from '../components/SeatRow';
import { ISeatGroupsData } from '../components/LayoutGeneratorForm';

export type Prettify<T> = {
  [K in keyof T]: T[K];
};


export const convertNumberToCode = (codeNumber: number): string => {
  let codeString = '';
  if (codeNumber == 0) {
    return 'A';
  }
  while (codeNumber > 0) {
    let r = 0;
    r = codeNumber % 26;
    codeString = codeString + String.fromCharCode(r + 65);
    codeNumber = (codeNumber / 26) >> 0;
  }
  return codeString.split('').reverse().join('');
};
export const convertCodeToNumber = (codeString: string) => {
  const reverseCodeString = codeString.split('').reverse().join('');
  const l = reverseCodeString.length;
  let sum = 0;
  for (let i = 0; i < l; i++) {
    sum = sum + (reverseCodeString.charCodeAt(i) - 65) * Math.pow(26, i);
  }
  return sum;
};

// '4D&AA99+16'
// {STATUS_CODE}{GRP_CODE}{&}{ROW}{COL}+SEAT_NO
export const getSeatDetails = (seatString: string) => {
  const regex = /^([0-9]+)([A-Z]+)&([A-Z]+)([0-9]+)\+([0-9]+)$/gm;
  const matches = seatString.matchAll(regex);
  const seatDetailsArray = [];
  for (const match of matches) {
    seatDetailsArray.push(match);
  }
  try {
    return {
      inputString: seatDetailsArray[0][0],
      seatStatusCode: seatDetailsArray[0][1],
      seatGrpCode: seatDetailsArray[0][2],
      seatRow: seatDetailsArray[0][3],
      seatCol: parseInt(seatDetailsArray[0][4], 10),
      seatNumber: parseInt(seatDetailsArray[0][5], 10),
    };
  } catch (err) {
    return null;
  }
};
export interface IRowDetails {
  inputString: string;
  grpRowIndex: number;
  rowHead: string;
  seatGrpCode: string;
  seatsString: string;
}
// 1:F:D000:D0+0:D0+0:4D&F16+16:4D&F15+15:D0+0:D0+0:4D&F12+15|
export const hasRowStarted = (rowString: string): IRowDetails | null => {
  const regex = /^([0-9]+:[A-Z]+:[A-Z]+000:)(.*)/gm;
  const matches = rowString.matchAll(regex);
  const seatDetailsArray = [];
  for (const match of matches) {
    seatDetailsArray.push(match);
  }
  if (seatDetailsArray.length > 0) {
    return {
      inputString: seatDetailsArray[0][0],
      grpRowIndex: parseInt(seatDetailsArray[0][1].split(':')[0], 10),
      rowHead: seatDetailsArray[0][1].split(':')[1],
      seatGrpCode: seatDetailsArray[0][1].split(':')[2].split('000')[0],
      seatsString: seatDetailsArray[0][2],
    };
  }
  return null;
};

// AA0+0
export const isAisle = (boxString: string): boolean => {
  const regex = /^[A-Z]+0\+0$/;
  return regex.test(boxString);
};

export const getSeats = (seatsString: string) => {
  return seatsString.split(':');
};

// ["1:F:BB000:BB0+0:BB0+0:4D&F16+16:4D&F15+15:BB0+0:BB0+0:4D&F12+15|", ...]
export const split = (infoString: string) => {
  return infoString.split('|');
};

export const getGroups = (layoutString: string) => {
  return layoutString.split('||');
};

export const seatGenerator = (
  groupCode: string,
  row: string,
  col: number,
  seatNumber: number,
  statusCode: SeatStatus = 'available',
) => {
  const status = SeatStatusCode[statusCode];
  return `${status}${groupCode}&${row}${col}+${seatNumber}`;
};

export const aisleGenerator = (grpCode: string) => `${grpCode}0+0`;
export const prependSeatRow = (
  grpIndex: number,
  rowHead: string,
  grpCode: string,
  gapCount: number,
  seatRow: string,
) =>
  `${grpIndex}:${rowHead}:${grpCode}000:${`${aisleGenerator(grpCode)}:`.repeat(
    gapCount,
  )}${seatRow}`;

export const grpGenerator = (
  grpName: string,
  grpCode: string,
  cost: number,
  order: number,
  currency = 'INR',
) => `${grpName}:${grpCode}:${cost}:${currency}:${order}:N`;
export const rowGenerator = (
  grpRowIndex: number,
  rowHead: string,
  seatGrpCode: string,
  maxSeatCount: number,
  gapCount = 2,
) => {
  const seats = [];
  for (let i = 0; i < maxSeatCount; i++) {
    seats.push(seatGenerator(seatGrpCode, rowHead, i + 1, maxSeatCount - i));
  }
  const seatsRow = `${seats.join(':')}`;
  const aisleString = Array.from({ length: gapCount }, () => aisleGenerator(seatGrpCode)).join(':');
  return `${grpRowIndex}:${rowHead}:${seatGrpCode}000:${aisleString}:${seatsRow}`;
};

export const getSeatNumber = (seat: string) => {
  try {
    return seat.split('+')[1];
  } catch (err) {
    throw `Exception: Not a valid seat number - ${seat}`;
  }
};
export const immutableInsertArray = <T>(row: T[], index: number, obj: T) => [
  ...row.slice(0, index),
  obj,
  ...row.slice(index + 1),
];

export const getUpdatedRow = (
  row: string[],
  index: number,
  grpCode: string,
  rowHead: string,
  layoutMode: LayoutModes,
  reverse = false,
) => {
  let updatedRow: string[] = [...row];

  if (reverse) {
    updatedRow = updatedRow.reverse();
    index = updatedRow.length - (index + 1);
  }

  const aisle = aisleGenerator(grpCode);
  const selectedSeat = getSeatDetails(updatedRow[index]);
  if (selectedSeat) {
    let seat = selectedSeat?.seatNumber ?? -1;
    if (layoutMode === 'creation') {
      updatedRow = immutableInsertArray(updatedRow, index, aisle);
      for (let i = index + 1; i < updatedRow.length; i++) {
        if (getSeatDetails(updatedRow[i])) {
          updatedRow = immutableInsertArray(
            updatedRow,
            i,
            seatGenerator(grpCode, rowHead, i, seat),
          );
          seat = seat + 1;
        }
      }
    } else {
      let updatedSeat = '';
      if (parseInt(selectedSeat.seatStatusCode, 10) === SeatStatusCode['available']) {
        updatedSeat = seatGenerator(
          selectedSeat.seatGrpCode,
          selectedSeat.seatRow,
          selectedSeat.seatCol,
          selectedSeat.seatNumber,
          'selected',
        );
      } else {
        updatedSeat = seatGenerator(
          selectedSeat.seatGrpCode,
          selectedSeat.seatRow,
          selectedSeat.seatCol,
          selectedSeat.seatNumber,
          'available',
        );
      }
      updatedRow = immutableInsertArray(updatedRow, index, updatedSeat);
    }
  } else {
    let nearestSeat = 0;
    for (let i = index; i >= 0; i--) {
      if (getSeatDetails(updatedRow[i])) {
        nearestSeat = getSeatDetails(updatedRow[i])?.seatNumber ?? -1;
        break;
      }
    }
    nearestSeat = nearestSeat + 1;
    updatedRow = immutableInsertArray(
      updatedRow,
      index,
      seatGenerator(grpCode, rowHead, index, nearestSeat),
    );

    // It's an aisle(empty space)
    for (let i = index + 1; i < updatedRow.length; i++) {
      if (getSeatDetails(updatedRow[i])) {
        nearestSeat = nearestSeat + 1;
        updatedRow = immutableInsertArray(
          updatedRow,
          i,
          seatGenerator(grpCode, rowHead, i, nearestSeat),
        );
      }
    }
  }
  if (reverse) {
    updatedRow = [...updatedRow].reverse();
  }

  return updatedRow;
};

export interface IGrpDetails {
  inputGroupString: string;
  grpName: string;
  grpCode: string;
  cost: number;
  grpOrder: number;
  currency: string;
  rows: IRowDetails[];
}

export const extractGroupsDetails = (grpDeatilsString: string): IGrpDetails | null => {
  const grpRegex = /^([A-Z]+):([A-Z]+):([\d]+):INR:([\d]+):N$/gm;
  const grpDetails = [];
  for (const match of grpDeatilsString.matchAll(grpRegex)) {
    grpDetails.push(match);
  }
  if (grpDetails.length > 0) {
    return {
      inputGroupString: grpDetails[0][0],
      grpName: grpDetails[0][1],
      grpCode: grpDetails[0][2],
      cost: parseInt(grpDetails[0][3], 10),
      grpOrder: parseInt(grpDetails[0][4], 10),
      currency: 'INR',
      rows: [],
    };
  }
  return null;
};

export const generateLayout = (layoutData: ISeatGroupsData) => {
  const grps = [];
  const rows = [];
  const totalRows = layoutData.groups.reduce((total, grp) => total + grp.row_count, 0);
  console.log('Total row count', totalRows);
  let count = 0;
  for (let i = 0; i < layoutData.groups.length; i++) {
    const activeGrp = layoutData.groups[i];
    grps.push(
      grpGenerator(activeGrp.group_name, convertNumberToCode(i), activeGrp.group_cost, i + 1),
    );
    for (let j = 0; j < activeGrp.row_count; j++) {
      rows.push(
        rowGenerator(
          j + 1,
          convertNumberToCode(totalRows - count - 1),
          convertNumberToCode(i),
          activeGrp.col_count,
        ),
      );
      count = count + 1;
    }
  }
  return `${grps.join('|')}||${rows.join('|')}`;
};
