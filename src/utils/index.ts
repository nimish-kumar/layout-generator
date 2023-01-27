export const generateRowGroupName = (code: number): string => {
  let grpName = '';
  if (code == 0) {
    return 'A';
  }
  while (code > 0) {
    let r = 0;
    r = code % 26;
    grpName = grpName + String.fromCharCode(r + 65);
    code = (code / 26) >> 0;
  }
  return grpName.split('').reverse().join('');
};
export const getIndexFromGrpName = (grpName: string) => {
  const reverseGrpName = grpName.split('').reverse().join('');
  const l = reverseGrpName.length;
  let sum = 0;
  for (let i = 0; i < l; i++) {
    sum = sum + (reverseGrpName.charCodeAt(i) - 65) * Math.pow(26, i);
  }
  return sum;
};

// '4D&AA99+16'
// {STATUS_CODE}{GRP_CODE}{&}{ROW}{COL}+SEAT_NO
export const extractSeatDetails = (seatString: string) => {
  const regex = /^([0-9]+)([A-Z]+)&([A-Z]+)([0-9]+)\+([0-9]+)$/gm;
  const matches = seatString.matchAll(regex);
  const seatDetailsArray = [];
  for (const match of matches) {
    seatDetailsArray.push(match);
  }
  return {
    inputString: seatDetailsArray[0][0],
    seatStatusCode: seatDetailsArray[0][1],
    seatGrpCode: seatDetailsArray[0][2],
    seatRow: seatDetailsArray[0][3],
    seatCol: seatDetailsArray[0][4],
    seatNumber: seatDetailsArray[0][5],
  };
};
// 1:F:BB000:BB0+0:BB0+0:4D&F16+16:4D&F15+15:BB0+0:BB0+0:4D&F12+15|
export const hasRowStarted = (rowString: string) => {
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
export const getRows = (rowsString: string) => {
  return rowsString.split('|');
};

export const getGroups = (layoutString: string) => {
  return layoutString.split('||');
};

export const seatGenerator = (
  statusCode: number,
  groupCode: string,
  row: string,
  col: number,
  seatNumber: number,
) => `${statusCode}${groupCode}&${row}${col}+${seatNumber}`;

export const aisleGenerator = (grpCode: string) => `${grpCode}0+0`;

// ----
export const getCreationModeSeatNumber = (seat: string) => seat.split('-seat')[0];
export const getImmediateSeat = (row: string[], index: number, reverse = false) => {
  const regex = /^([0-9]+)(-seat)$/;
  if (reverse) {
    for (let i = index; i <= row.length - 1; i++) {
      if (regex.test(row[i])) {
        return parseInt(row[i].split('-seat')[0], 10);
      }
    }
  } else {
    for (let i = index; i >= 0; i--) {
      if (regex.test(row[i])) {
        console.log('--->', row[i]);
        return parseInt(row[i].split('-seat')[0], 10);
      }
    }
  }
  return -1;
};

export const getSeatNumber = (seat: string) => seat.split('-seat')[0];
// ----
export const modifyArr = <T>(row: T[], index: number, obj: T) => [
  ...row.slice(0, index),
  obj,
  ...row.slice(index + 1),
];

export const getUpdatedRow = (row: string[], index: number, reverse = false) => {
  let updatedRow: string[] = [...row];

  if (reverse) {
    updatedRow = updatedRow.reverse();
    index = updatedRow.length - (index + 1);
  }
  console.log('Updated row', updatedRow);
  console.log('Clicked index', index);

  const seatRegex = /^([0-9]+)(-seat)$/;
  const aisle = 'aisle';
  if (seatRegex.test(updatedRow[index])) {
    let seat = parseInt(updatedRow[index].split('-seat')[0], 10);
    updatedRow = modifyArr(updatedRow, index, aisle);
    for (let i = index + 1; i < updatedRow.length; i++) {
      if (seatRegex.test(updatedRow[i])) {
        updatedRow = modifyArr(updatedRow, i, `${seat}-seat`);
        seat = seat + 1;
      }
    }
  } else {
    let nearestSeat = 0;
    for (let i = index; i >= 0; i--) {
      if (seatRegex.test(updatedRow[i])) {
        nearestSeat = parseInt(updatedRow[i].split('-seat')[0], 10);
        break;
      }
    }
    nearestSeat = nearestSeat + 1;
    updatedRow = modifyArr(updatedRow, index, `${nearestSeat}-seat`);

    // It's an aisle(empty space)
    for (let i = index + 1; i < updatedRow.length; i++) {
      if (seatRegex.test(updatedRow[i])) {
        nearestSeat = nearestSeat + 1;
        updatedRow = modifyArr(updatedRow, i, `${nearestSeat}-seat`);
      }
    }
  }
  if (reverse) {
    updatedRow = [...updatedRow].reverse();
  }
  return updatedRow;
};
