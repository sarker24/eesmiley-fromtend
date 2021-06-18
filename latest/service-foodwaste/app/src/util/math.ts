function round(value: number, precision: number = 2) {
  return +(value.toFixed(precision));
}

// Calculates how much bigger (or smaller) the next value is.
// if ratio < 0.00%, to is smaller
// if ratio > 0.00%, to is bigger
function changeRatio(from: number, to: number): number {
  if (from === 0) {
    return -to;
  }

  return ((to - from) / from);
}

export { round, changeRatio };
