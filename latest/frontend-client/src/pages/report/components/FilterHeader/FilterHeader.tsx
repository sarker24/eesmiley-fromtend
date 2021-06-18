import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Grid, IconButton } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import SVGInline from 'react-svg-inline';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Dimension, ReportFilterState } from 'redux/ducks/reports-new';
import TimeFilter from 'report/components/TimeFilter';
import { AccountPointFilterWithNames } from 'redux/ducks/reports-new/selectors';
import AccountSelect from 'report/components/AccountSelect';
import RegistrationPointSelect from 'report/components/RegistrationPointSelect';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import { LABELS } from 'utils/labels';
import CloseIcon from '@material-ui/icons/Close';
import SortButton from 'report/components/SortButton';
import { chartColors } from 'report/Accounts';
import balanceScale from 'static/icons/balance-scale.svg';
import EmissionIcon from 'icons/emission';
import GuestTypeSelect from 'report/components/GuestTypeSelect';

const InputLabels = {
  area: 'report.filter.filterIn',
  category: 'report.filter.for',
  product: 'report.filter.andSpecifically'
};

interface ComponentProps extends InjectedIntlProps {
  filter: ReportFilterState;
  registrationPointFilters: AccountPointFilterWithNames[];
  onAccountChange: (id, accounts) => void;
  onRegistrationPointChange: (id, points) => void;
  onAddRegistrationPointFilter: () => void;
  onRemoveRegistrationPointFilter: (id) => void;
  onOrderChange: (id, order) => void;
  onDimensionChange: (event: React.MouseEvent<HTMLElement>, newDimension: Dimension) => void;
  config: {
    enableDimension: boolean;
    enableRegistrationPoints: boolean;
    enableComparison: boolean;
    enableSort: boolean;
  };
  guestTypeNames: string[];
  onGuestTypeChange: (names: string[]) => void;
}

const FilterHeader: React.FunctionComponent<ComponentProps> = (props) => {
  const {
    filter: { dimension, selectedGuestTypeNames },
    registrationPointFilters,
    config: { enableDimension, enableComparison, enableRegistrationPoints, enableSort },
    onDimensionChange,
    onAccountChange,
    onRegistrationPointChange,
    onAddRegistrationPointFilter,
    onRemoveRegistrationPointFilter,
    onOrderChange,
    guestTypeNames,
    onGuestTypeChange,
    intl
  } = props;

  const classes = useStyles(props);
  const availableFilters = enableComparison
    ? registrationPointFilters
    : registrationPointFilters.slice(0, 1);

  return (
    <div className={classes.container}>
      <Grid container>
        <Grid className={classNames([classes.row, classes.topRow])} container alignItems={'center'}>
          <Grid item className={classes.timeFilter}>
            <Typography
              component='div'
              className={classNames(['headerFilterLabel', classes.fixed120md, classes.label])}
            >
              {intl.messages['project.timeline.period']}
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.fixed260md}>
            <TimeFilter />
          </Grid>
          {enableDimension && (
            <Grid
              container
              item
              xs={12}
              md
              justify='flex-end'
              className={classes['xs-order-first']}
            >
              {guestTypeNames.length > 0 && (
                <div className={classes.guestTypeFilter}>
                  <Typography
                    component='div'
                    className={classNames(['headerFilterLabel', classes.label])}
                  >
                    {((intl.messages['settings.guestType'] as unknown) as { other: string }).other}
                  </Typography>
                  <GuestTypeSelect
                    available={guestTypeNames}
                    selected={selectedGuestTypeNames}
                    onChange={onGuestTypeChange}
                  />
                </div>
              )}
              <ToggleButtonGroup
                value={dimension}
                exclusive
                onChange={onDimensionChange}
                aria-label='filter the data by cost or weight'
                className={classes.togglerDimension}
              >
                <ToggleButton
                  value='cost'
                  aria-label='filter by cost'
                  disabled={dimension === 'cost'}
                >
                  <span className={classes.toggleButtonIcon}>$</span>
                  {intl.messages['report.dimension.cost']}
                </ToggleButton>
                <ToggleButton
                  value='weight'
                  aria-label='filter by weight'
                  disabled={dimension === 'weight'}
                >
                  <span className={classes.toggleButtonIcon}>
                    <SVGInline svg={balanceScale} />
                  </span>
                  {intl.messages['report.dimension.weight']}
                </ToggleButton>
                <ToggleButton value='co2' aria-label='filter by co2' disabled={dimension === 'co2'}>
                  <span className={classes.toggleButtonIcon}>
                    <EmissionIcon />
                  </span>
                  CO2
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          )}
        </Grid>
        {availableFilters.map((filter, filterIndex) => (
          <Grid
            className={classNames(classes.row, {
              [classes.rowMultipleFilter]: availableFilters.length > 1,
              [classes.rowBordered]: availableFilters.length > 1
            })}
            container
            key={`registration_points_${filterIndex}`}
            justify={'space-between'}
            alignItems={'center'}
          >
            {filterIndex > 0 && (
              <Grid item className={classes.deleteButton}>
                <IconButton
                  size='small'
                  edge='start'
                  onClick={() => onRemoveRegistrationPointFilter(filterIndex)}
                >
                  <CloseIcon fontSize={'small'} />
                </IconButton>
              </Grid>
            )}
            <Grid item className={classes.accountFilter}>
              <Typography
                component='div'
                className={classNames(['headerFilterLabel', classes.label, classes.fixed120md])}
              >
                {enableComparison
                  ? null
                  : ((intl.messages['department'] as unknown) as { other: string }).other}
              </Typography>
              <div className={classes.accountSelect}>
                <div className={classNames(['headerFilterAccount', classes.fixed260lg])}>
                  <AccountSelect
                    avatarProps={
                      enableComparison
                        ? {
                            style: {
                              backgroundColor: chartColors[filterIndex % (chartColors.length - 1)]
                            }
                          }
                        : { className: classes.avatarTransparent }
                    }
                    availableAccounts={filter.availableAccounts}
                    selectedAccounts={filter.accounts}
                    accountQuery={filter.accountQuery}
                    onChange={(accounts) => onAccountChange(filterIndex, accounts)}
                  />
                </div>
                {enableSort && (
                  <SortButton
                    className={classes.sortButton}
                    size='small'
                    color='primary'
                    onSortChange={(sort) => onOrderChange(filterIndex, sort)}
                    sortOrder={filter.order}
                  />
                )}
              </div>
            </Grid>
            {enableRegistrationPoints && (
              <Grid item xs={12} lg container className={classes.registrationPointFilterList}>
                {LABELS.map((label) => (
                  <div
                    className={classes.registrationPointFilterListItem}
                    key={`registration_point_${filterIndex}_${label}`}
                  >
                    <Typography
                      component='div'
                      className={classNames(['headerFilterLabel', classes.label])}
                    >
                      {intl.messages[InputLabels[label]]}
                    </Typography>
                    <div className={classNames('headerFilterRegistrationPoint')}>
                      <RegistrationPointSelect
                        label={label}
                        available={filter.availableRegistrationPoints[label]}
                        selected={filter.selectedRegistrationPoints[label]}
                        onChange={(label, names) =>
                          onRegistrationPointChange(filterIndex, { [label]: names })
                        }
                      />
                    </div>
                  </div>
                ))}
              </Grid>
            )}
          </Grid>
        ))}
        {enableComparison && (
          <Grid container className={classNames([classes.row, classes.rowBordered])}>
            <Grid item xs={12}>
              <Button
                className={classes.fixed120mdMarginLeft}
                variant='contained'
                color='primary'
                onClick={onAddRegistrationPointFilter}
              >
                {intl.messages['base.compare']}
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

const CustomFilterRowBreakpointInPx = 1500;
const ToggleWidthInPx = 220;

const useStyles = makeStyles((theme) => ({
  avatarTransparent: {
    color: 'inherit',
    backgroundColor: 'transparent'
  },
  sortButton: {
    marginLeft: theme.spacing(1)
  },
  accountSelect: {
    display: 'flex'
  },
  container: {
    backgroundColor: theme.palette.common.white,
    margin: '0 -12px'
  },
  topRow: {
    paddingTop: theme.spacing(1)
  },
  row: {
    padding: theme.spacing(0, 3.2, 1),
    position: 'relative',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  rowBordered: {
    borderTop: `2px solid ${theme.palette.grey.A700}`,
    '&:last-child': {
      borderBottom: `2px solid ${theme.palette.grey.A700}`,
      marginBottom: theme.spacing(1)
    }
  },
  rowMultipleFilter: {
    '&:nth-child(even)': {
      backgroundColor: '#f9f9f9'
    }
  },
  'xs-order-first': {
    [theme.breakpoints.down('sm')]: {
      order: -1
    }
  },
  timeFilter: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      display: 'block',
      '& > *': {
        width: '100%'
      }
    }
  },
  togglerDimension: {
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      marginBottom: theme.spacing(2)
    }
  },
  toggleButtonIcon: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.light,
    marginRight: 7,

    '& svg': {
      fill: theme.palette.primary.light,
      width: 16
    },

    '.Mui-selected &': {
      color: theme.palette.common.white,

      '& svg': {
        fill: theme.palette.common.white
      }
    }
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.pxToRem(12),
      width: '100%',
      marginRight: 'initial',
      marginBottom: theme.typography.pxToRem(5)
    }
  },
  fixed120md: {
    width: theme.typography.pxToRem(100),
    flexBasis: 'auto'
  },
  fixed260md: {
    [theme.breakpoints.up('md')]: {
      width: theme.typography.pxToRem(270),
      flexBasis: 'auto'
    }
  },
  fixed120mdMarginLeft: {
    [theme.breakpoints.up(CustomFilterRowBreakpointInPx)]: {
      marginLeft: theme.typography.pxToRem(108)
    }
  },
  fixed260lg: {
    [theme.breakpoints.up('lg')]: {
      width: theme.typography.pxToRem(270),
      flexBasis: 'auto'
    }
  },
  deleteButton: {
    [theme.breakpoints.up(CustomFilterRowBreakpointInPx)]: {
      position: 'absolute'
    }
  },
  accountFilter: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down(CustomFilterRowBreakpointInPx)]: {
      display: 'block',
      width: '100%',
      paddingBottom: theme.spacing(2),
      '& .headerFilterLabel, & .headerFilterAccount': {
        width: '100%'
      },
      '& .headerFilterLabel': {
        width: '100%',
        marginRight: 'initial',
        marginBottom: theme.typography.pxToRem(5)
      }
    }
  },
  registrationPointFilterList: {
    justifyContent: 'flex-end',
    [theme.breakpoints.down(CustomFilterRowBreakpointInPx)]: {
      justifyContent: 'space-between'
    }
  },
  registrationPointFilterListItem: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1),
    '& .headerFilterRegistrationPoint': {
      width: theme.typography.pxToRem(ToggleWidthInPx)
    },
    [theme.breakpoints.down(CustomFilterRowBreakpointInPx)]: {
      width: '32%',
      flexFlow: 'row wrap',
      marginLeft: 'initial',
      '& .headerFilterRegistrationPoint': {
        width: '100%'
      },
      '& .headerFilterLabel': {
        width: '100%',
        marginRight: 'initial',
        marginBottom: theme.typography.pxToRem(5)
      }
    }
  },
  guestTypeFilter: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(2)
  }
}));

export default injectIntl(FilterHeader);
