import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import { CardHeader, Theme, Card, CardContent, Typography } from '@material-ui/core';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import TabContainer from 'report/components/TabContainer';
import FoodWasteDistribution from 'report/components/FoodWasteDistribution';
import Trend from './components/Trend';
import { Basis } from 'redux/ducks/reports-new';

interface OwnProps {
  onTabChange: (basis) => void;
  basis: Basis;
}

interface ComponentProps extends OwnProps, InjectedIntlProps {}

const FoodWasteOverview: React.FunctionComponent<ComponentProps> = (props) => {
  const classes = useStyles(props);
  const { onTabChange, basis, intl } = props;

  return (
    <Card>
      <CardHeader title={intl.messages['report.overview']} />
      <CardContent>
        <TabContainer onTabChange={onTabChange} initialValue={basis}>
          <div className={classes.tabContent}>
            <Typography variant={'body1'} paragraph={true}>
              {basis === 'per-guest'
                ? intl.messages['report.quickOverview.foodwastePerGuest.description']
                : intl.messages['report.quickOverview.totalFoodwaste.description']}
            </Typography>
            <FoodWasteDistribution />
            <Trend />
          </div>
        </TabContainer>
      </CardContent>
    </Card>
  );
};

const useStyles = makeStyles<Theme, ComponentProps>((theme) => ({
  tabContent: {
    margin: theme.spacing(3, 0, 0)
  }
}));

export default injectIntl(FoodWasteOverview);
