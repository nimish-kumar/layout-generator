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
export const getIndex = (grpName: string) => {
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

export const hasRowStarted = (rowString: string) => {
  const regex = /^([A-Z]+:[A-Z]+000:)(.*)(\|$)/gm;
  const matches = rowString.matchAll(regex);
  const seatDetailsArray = [];
  for (const match of matches) {
    seatDetailsArray.push(match);
  }
  return {
    inputString: seatDetailsArray[0][0],
    rowHead: seatDetailsArray[0][1].split(':')[0],
    seatGrpCode: seatDetailsArray[0][1].split(':')[1].split('000')[0],
    seatsString: seatDetailsArray[0][2],
  };
};

// AA0+0
export const isAisle = (boxString: string): boolean => {
  const regex = /^[A-Z]+0\+0$/gm;
  return regex.test(boxString);
};
export const getSeats = (seatsString: string) => {
  return seatsString.split(':');
};

// ["F:BB000:BB0+0:BB0+0:4D&F99+16:4D&F98+15:BB0+0:BB0+0|", ...]
export const getRows = (rowsString: string) => {
  return rowsString.split('|').map((row) => `${row}|`);
};
