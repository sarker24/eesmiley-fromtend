import * as React from 'react';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { Bar } from 'report/components/Chart';
import { useState } from 'react';
import getChartData from 'report/components/Chart/utils/getChartData';
import { limitVisiblePoints, seriesMappers, themeMapper } from './utils/chartMappers';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import createValueFormatter from 'report/utils/createValueFormatter';
import { Box, Button, Typography } from '@material-ui/core';
import { chartColors } from 'report/Accounts/utils/constants';
import { RootState } from 'redux/rootReducer';

type StoreProps = ReturnType<typeof mapStateToProps>;

interface ComponentProps extends StoreProps, InjectedIntlProps {}

const identifier = 'foodWastePerAccount';
const accountsLimit = 10;

const FoodWastePerAccount: React.FunctionComponent<ComponentProps> = (props) => {
  const { perAccountSeries, intl } = props;
  const { data: chartsData, isLoading, basis, dimension } = perAccountSeries;
  const [chartOptions, setChartOptions] = useState({});
  const [viewAll, setViewAll] = useState<boolean>(false);

  const handleViewAllChange = () => {
    setViewAll((prev) => !prev);
  };

  const accountsSeries =
    chartsData &&
    chartsData.series &&
    chartsData.series.find((series) => series.id === 'perAccountGroups');
  const uniqueLabels: string[] = accountsSeries
    ? Array.from(
        new Set(
          accountsSeries.series.flatMap((series) => series.points.map((point) => point.label))
        )
      )
    : [];
  const hasMoreAccountsThanLimit: boolean = uniqueLabels.length > accountsLimit;

  useEffect(() => {
    if (accountsSeries && !isLoading) {
      const valueFormatter = createValueFormatter(dimension, basis);
      const series = limitVisiblePoints(
        accountsSeries.series,
        uniqueLabels,
        viewAll,
        accountsLimit
      );
      const foodWastePerAccount = { ...accountsSeries, series };
      const chartData = getChartData(
        {
          series: foodWastePerAccount.series,
          unit: foodWastePerAccount.unit,
          target: foodWastePerAccount.extra.target,
          chartColors,
          plotLines: {
            target: foodWastePerAccount.extra.target,
            average: foodWastePerAccount.aggregates.avg
          },
          intl
        },
        seriesMappers(),
        themeMapper(valueFormatter)
      );
      setChartOptions(chartData);
    }
  }, [chartsData, viewAll]);

  return (
    <>
      <Box alignItems='baseline' display='inline-flex'>
        <Typography>
          {hasMoreAccountsThanLimit && !viewAll
            ? intl.formatMessage(
                { id: 'report.accounts.showingFirstAccounts' },
                { number: accountsLimit }
              )
            : intl.messages['report.accounts.showingAll']}
        </Typography>
        {hasMoreAccountsThanLimit && (
          <Button
            onClick={handleViewAllChange}
            color='primary'
            disabled={!hasMoreAccountsThanLimit}
          >
            {!viewAll ? intl.messages['base.showAll'] : intl.messages['base.hide']}
          </Button>
        )}
      </Box>
      <Bar chartOptions={chartOptions} isLoading={isLoading} />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  perAccountSeries: state.reportData[identifier]
});

export default connect<StoreProps, unknown, unknown>(mapStateToProps)(
  injectIntl(FoodWastePerAccount)
);
