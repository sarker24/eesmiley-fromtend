import * as React from 'react';
import { PageTitle } from 'report/components/ReportPageLayout';
import FoodWasteDistribution from 'report/components/FoodWasteDistribution';
import { Card, CardContent, CardHeader, Grid } from '@material-ui/core';
import FactsOverview from './components/FactsOverview';
import FoodWasteStatus from './components/FoodWasteStatus';
import { Basis, ReportFilterState } from 'redux/ducks/reports-new';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import getFormattedTimeRange from 'report/utils/getFormattedDateRange';

interface ComponentProps extends InjectedIntlProps {
  basis: Basis;
  downloadButton: React.ReactNode;
  filter: ReportFilterState;
}

const FoodWaste: React.FunctionComponent<ComponentProps> = (props) => {
  const {
    basis,
    downloadButton,
    intl,
    filter: {
      timeRange: { from: startDate, to: endDate },
      period
    }
  } = props;

  return (
    <>
      <PageTitle>
        {basis === 'per-guest'
          ? intl.messages['report.foodwaste.perGuest.title']
          : intl.messages['report.totalFoodwaste.title']}
      </PageTitle>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <FactsOverview />
        </Grid>
        <Grid item xs={12}>
          <FoodWasteStatus />
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={intl.messages['report.foodwaste.overviewPercentages.title']}
              subheader={intl.formatMessage(
                {
                  id:
                    basis === 'per-guest'
                      ? 'report.foodwaste.perGuest.overviewPercentages.description'
                      : 'report.foodwaste.total.overviewPercentages.description'
                },
                {
                  range: getFormattedTimeRange(startDate, endDate),
                  period: period
                }
              )}
            />
            <CardContent>
              <FoodWasteDistribution />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {downloadButton}
    </>
  );
};

export default injectIntl(FoodWaste);
