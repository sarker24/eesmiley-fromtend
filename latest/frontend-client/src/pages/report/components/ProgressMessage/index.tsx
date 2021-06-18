import * as React from 'react';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { Typography } from '@material-ui/core';

interface ComponentProps extends InjectedIntlProps {
  id: string;
  trend?: number;
  value?: string;
  target?: string;
}

const ProgressMessage: React.FunctionComponent<ComponentProps> = ({
  id,
  trend,
  value,
  target,
  intl
}) => (
  <FormattedMessage
    id={id}
    values={{
      trend: trend && (
        <Typography color={'textSecondary'} display={'inline'} style={{ fontWeight: 900 }}>
          {intl.formatNumber(Math.abs(trend), { maximumFractionDigits: 2 }) + '% '}
        </Typography>
      ),
      value,
      target
    }}
  />
);

export default injectIntl(ProgressMessage);
