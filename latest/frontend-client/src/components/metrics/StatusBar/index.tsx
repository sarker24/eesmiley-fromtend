import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Theme } from '@material-ui/core';
import classNames from 'classnames';
import { Link } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import NoData, { NoDataProps } from 'metrics/NoData';

export type Growth = 'positive' | 'negative' | 'equal' | 'noTarget' | 'noData' | 'noTrend';

export interface StatusBarProps extends NoDataProps {
  growth: Growth;
  viewMore?: string;
}

type OwnProps = StatusBarProps & InjectedIntlProps;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1),
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '3.1rem',
    minHeight: '48px'
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > * + *': {
      marginLeft: theme.spacing(0.5)
    },
    paddingLeft: theme.spacing(2)
  },
  missingData: {
    backgroundColor: 'rgba(240, 240, 240, 0.3)'
  },
  noTrend: {
    backgroundColor: theme.palette.grey['A700']
  },
  equal: {
    backgroundColor: theme.palette.success.light
  },
  positive: {
    backgroundColor: theme.palette.success.light
  },
  negative: {
    backgroundColor: theme.palette.error.light
  },
  viewMoreButton: {
    fontWeight: 600,
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.common.white,
    textTransform: 'none',
    flex: '0 0 auto'
  }
}));

const StatusBar: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const { intl, growth, viewMore, children, onHelp } = props;
  const hasNoData = growth === 'noData' || growth === 'noTarget';

  return (
    <div
      className={classNames(classes.root, {
        [classes.missingData]: hasNoData,
        [classes[growth]]: !hasNoData
      })}
    >
      <div className={classes.content}>
        {hasNoData ? (
          <NoData onHelp={onHelp}>
            {intl.messages[growth === 'noTarget' ? 'base.noTarget' : 'base.notEnoughData']}
          </NoData>
        ) : (
          children
        )}
      </div>
      {viewMore && (
        <Button
          disableElevation
          className={classes.viewMoreButton}
          variant='contained'
          component={Link}
          to={viewMore}
          disabled={hasNoData}
        >
          {intl.messages['base.viewMore']}
        </Button>
      )}
    </div>
  );
};
export default injectIntl(StatusBar);
