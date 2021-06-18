import * as React from 'react';
import { connect } from 'react-redux';
import { formatWeight } from 'utils/number-format';
import { getCorrectFloatValue } from 'utils/math';
import { RootState } from 'redux/rootReducer';

interface StateProps {
  unit: any;
}

export interface OwnProps {
  value?: number;
  // if value is in the smallest subunit already, make this true
  normalized: boolean; //false
  minimumFractionDigits?: number; //3
  maximumFractionDigits?: number; //3

  style: 'decimal' | 'currency' | 'percent'; //decimal default
  currency?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name'; //symbol default
  useGrouping?: boolean; //default true
  minimumIntegerDigits?: number; //default 1
  minimumSignificantDigits?: number; //default 1
  maximumSignificantDigits?: number;
  localeMatcher?: 'best fit' | 'lookup'; //best fit default
}

type FormattedMassProps = StateProps & OwnProps;

function FormattedMass({ value, normalized = false, unit }: FormattedMassProps) {
  return <span>{formatWeight(value, !normalized, unit)}</span>;
}

export default connect<StateProps, unknown, OwnProps>((state: RootState) => ({
  unit: state.settings.unit
}))(FormattedMass);

/**
 * Only integers
 * @param {integer} value - grams
 */
export function formatMass(value: number) {
  return !value ? value : getCorrectFloatValue(value / 1000);
}

export function unformatMass(value: string | number) {
  return !value
    ? value
    : getCorrectFloatValue(typeof value === 'string' ? parseFloat(value) * 1000 : value * 1000);
}
