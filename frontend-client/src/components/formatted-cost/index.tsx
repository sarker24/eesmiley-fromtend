import * as React from 'react';
import { formatMoney } from 'utils/number-format';

export interface FormattedCostProps {
  value: number;
  inMajorUnit?: boolean;
  style?: any;
}

const FormattedCost: React.FunctionComponent<FormattedCostProps> = ({
  value,
  inMajorUnit = false
}: FormattedCostProps) => {
  return <span>{formatMoney(value, { inMajorUnit: inMajorUnit }).toString()}</span>;
};

export default FormattedCost;
