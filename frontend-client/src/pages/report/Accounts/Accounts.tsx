import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { PageTitle } from 'report/components/ReportPageLayout';
import TabContainer from 'report/components/TabContainer';
import { CardHeader, Grid, makeStyles, Theme, Card, CardContent } from '@material-ui/core';
import BarChartGroup from 'report/components/BarChartGroup';
import getCategorisedData from './utils/getCategorisedData';
import FoodWastePerAccount from './components/FoodWastePerAccount';
import { Basis } from 'redux/ducks/reports-new';
import FoodWastePerAccountFilter from './components/FoodWastePerAccountFilter';
import ErrorMessage from 'report/components/ErrorMessage';
import { chartColors, TOP_ROW_CHARTS_MIN_HEIGHT } from 'report/Accounts/utils/constants';
import { ReportChart, SeriesResponse } from 'redux/ducks/reportData';

interface OwnProps {
  accountSeries: ReportChart<SeriesResponse>;
  onTabChange: (basis: Basis) => void;
  downloadButton: React.ReactNode;
}

interface ComponentProps extends OwnProps, InjectedIntlProps {}

const Accounts: React.FunctionComponent<ComponentProps> = (props) => {
  const { accountSeries, onTabChange, intl, downloadButton } = props;
  const { data: chartsData, basis, dimension, error, isLoading } = accountSeries;
  const classes = useStyles(props);
  const transposedSeries =
    (chartsData &&
      chartsData.series &&
      chartsData.series.length > 0 &&
      getCategorisedData(chartsData.series[0].series, basis)) ||
    [];
  return (
    <>
      <PageTitle>{intl.messages['report.accounts.title']}</PageTitle>
      <Card>
        <CardHeader title={intl.messages['report.accounts.foodwastePerAccount']} />
        <CardContent>
          <TabContainer onTabChange={onTabChange} initialValue={basis}>
            {error ? (
              <ErrorMessage error={error} />
            ) : (
              <div className={classes.tabContent}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6} lg={5}>
                    <FoodWastePerAccount />
                  </Grid>
                  <Grid item xs={12} md={6} lg={7} container alignContent={'flex-start'}>
                    <Grid item xs={12} className={classes.donut}>
                      <FoodWastePerAccountFilter basis={basis} />
                    </Grid>
                    <Grid container spacing={4} className={classes.barsGroup}>
                      <BarChartGroup
                        isLoading={isLoading}
                        chartsData={transposedSeries}
                        colors={chartColors}
                        basis={basis}
                        dimension={dimension}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </div>
            )}
          </TabContainer>
        </CardContent>
      </Card>
      {downloadButton}
    </>
  );
};

const useStyles = makeStyles<Theme, ComponentProps>((theme) => ({
  tabContent: {
    margin: theme.spacing(3, 0)
  },
  barsGroup: {
    marginTop: 50
  },
  donut: {
    [theme.breakpoints.up('sm')]: {
      height: TOP_ROW_CHARTS_MIN_HEIGHT
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 30
    }
  }
}));

export default injectIntl(Accounts);
