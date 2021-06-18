import { formatMoney, formatWeight } from 'utils/number-format';
import { Basis, Dimension } from 'redux/ducks/reports-new';

export type FormatFn = (value: number, unit?: string) => string;
export type Formatter = { format: FormatFn };

const createValueFormatter = (dimension: Dimension, basis: Basis): Formatter => {
  let format: FormatFn;

  if (dimension === 'cost') {
    format = (value) => formatMoney(value).toString();
  } else if (dimension === 'weight' || dimension === 'co2') {
    format = (value) =>
      basis === 'per-guest' ? formatWeight(value, true, 'g') : formatWeight(value, false);
  } else {
    format = (value, unit) => `${value} ${unit}`;
  }

  return {
    format
  };
};

export default createValueFormatter;
