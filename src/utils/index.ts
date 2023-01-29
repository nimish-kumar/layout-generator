import { SeatStatus, SeatStatusCode } from '../components/Layout';

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
export const isSeat = (seatString: string) => {
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
// 1:F:BB000:BB0+0:BB0+0:4D&F16+16:4D&F15+15:BB0+0:BB0+0:4D&F12+15|
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
export const getSeatNumber = (seat: string) => {
  try {
    return seat.split('+')[1];
  } catch (err) {
    throw `Exception: Not a valid seat number - ${seat}`;
  }
};
export const modifyArr = <T>(row: T[], index: number, obj: T) => [
  ...row.slice(0, index),
  obj,
  ...row.slice(index + 1),
];

export const getUpdatedRow = (
  row: string[],
  index: number,
  grpCode: string,
  rowHead: string,
  reverse = false,
) => {
  let updatedRow: string[] = [...row];

  if (reverse) {
    updatedRow = updatedRow.reverse();
    index = updatedRow.length - (index + 1);
  }
  console.log('Incoming row', updatedRow);
  console.log('Clicked index', index);

  const aisle = aisleGenerator(grpCode);
  const selectedSeat = isSeat(updatedRow[index]);
  if (selectedSeat) {
    let seat = selectedSeat?.seatNumber ?? -1;
    updatedRow = modifyArr(updatedRow, index, aisle);
    for (let i = index + 1; i < updatedRow.length; i++) {
      if (isSeat(updatedRow[i])) {
        updatedRow = modifyArr(updatedRow, i, seatGenerator(grpCode, rowHead, i, seat));
        seat = seat + 1;
      }
    }
  } else {
    let nearestSeat = 0;
    for (let i = index; i >= 0; i--) {
      if (isSeat(updatedRow[i])) {
        nearestSeat = isSeat(updatedRow[i])?.seatNumber ?? -1;
        break;
      }
    }
    nearestSeat = nearestSeat + 1;
    updatedRow = modifyArr(updatedRow, index, seatGenerator(grpCode, rowHead, index, nearestSeat));

    // It's an aisle(empty space)
    for (let i = index + 1; i < updatedRow.length; i++) {
      if (isSeat(updatedRow[i])) {
        nearestSeat = nearestSeat + 1;
        updatedRow = modifyArr(updatedRow, i, seatGenerator(grpCode, rowHead, i, nearestSeat));
      }
    }
  }
  if (reverse) {
    updatedRow = [...updatedRow].reverse();
  }
  console.log('Updated row', updatedRow);
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
  const grpRegex = /^([A-Z ]+[A-Z]+):([A-Z]+):([\d]+):INR:([\d]+):N$/gm;
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
