import * as React from 'react';
import { connect } from 'react-redux';
import { Donut } from 'report/components/Chart';
import { Basis } from 'redux/ducks/reports-new';
import donutChartOptions from 'report/components/Chart/Donut/options';
import { Typography } from '@material-ui/core';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import createValueFormatter from 'report/utils/createValueFormatter';
import { chartColors } from 'report/Accounts/utils/constants';
import { RootState } from 'redux/rootReducer';
import ChartTitle from 'report/Accounts/components/FoodWastePerAccountFilter/ChartTitle';

type StoreProps = ReturnType<typeof mapStateToProps>;

interface OwnProps {
  basis: Basis;
}

interface ComponentProps extends StoreProps, OwnProps {}

const identifier = 'foodWastePerAccount';

const FoodWastePerAccountFilter: React.FunctionComponent<ComponentProps & InjectedIntlProps> = (
  props
) => {
  const { perAccountSeries, intl } = props;
  const { data: chartsData, isLoading, dimension, basis } = perAccountSeries;
  const pointFormatter = createValueFormatter(dimension, basis);
  const foodWastePerAccountFilter =
    chartsData &&
    chartsData.series &&
    chartsData.series.find((series) => series.id === 'groupTotalSeries');
  const exactFoodWastePerAccountFilter =
    foodWastePerAccountFilter &&
    foodWastePerAccountFilter.series &&
    foodWastePerAccountFilter.series.find((series) => series.id === 'totalAmountSeries');
  const foodWasteRatiosPerAccountFilter =
    foodWastePerAccountFilter &&
    foodWastePerAccountFilter.series &&
    foodWastePerAccountFilter.series.find((series) => series.id === 'totalRatioSeries');
  const otherPoint =
    exactFoodWastePerAccountFilter &&
    exactFoodWastePerAccountFilter.points.find((point) => point.label.toLowerCase() === 'other');
  const foodWasteInSelectedAccounts =
    exactFoodWastePerAccountFilter &&
    exactFoodWastePerAccountFilter.aggregates.total - (otherPoint ? otherPoint.value : 0);

  const perAccountData = chartsData.series.find((s) => s.id === 'perAccountGroups');
  const accountAverage = perAccountData ? perAccountData.aggregates.avg : 0;

  return (
    <>
      {basis === 'total' ? (
        <Donut
          options={{
            colors: chartColors,
            total: exactFoodWastePerAccountFilter
              ? exactFoodWastePerAccountFilter.aggregates.total
              : undefined,
            exactValues: exactFoodWastePerAccountFilter,
            showExactValues: true
          }}
          seriesData={[foodWasteRatiosPerAccountFilter]}
          chartOptions={donutChartOptions}
          isLoading={isLoading}
        />
      ) : null}
      <ChartTitle variant={'h1'} component={'p'} align={'center'} isLoading={isLoading}>
        {exactFoodWastePerAccountFilter &&
          (basis === 'per-guest'
            ? pointFormatter.format(accountAverage, exactFoodWastePerAccountFilter.unit)
            : pointFormatter.format(
                foodWasteInSelectedAccounts,
                exactFoodWastePerAccountFilter.unit
              ))}
      </ChartTitle>
      <Typography variant={'body1'} align={'center'}>
        {basis === 'per-guest'
          ? intl.messages['report.accounts.avgFWPerGuestInSelectedAccounts']
          : intl.messages['report.accounts.totalFoodwasteInSelectedAccounts']}
      </Typography>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  perAccountSeries: state.reportData[identifier]
});

export default connect<StoreProps, unknown, OwnProps>(mapStateToProps)(
  injectIntl(FoodWastePerAccountFilter)
);
