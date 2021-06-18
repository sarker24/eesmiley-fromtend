import * as React from 'react';
import { PageTitle } from 'report/components/ReportPageLayout';
import { Card, CardHeader, CardContent, Grid, Divider } from '@material-ui/core';
import SVGInline from 'react-svg-inline';
import { makeStyles } from '@material-ui/core/styles';
import getReportPages from '../utils/getReportPages';
import { Link } from 'react-router';
import OverlayBox from 'report/components/OverlayBox';
import { injectIntl, InjectedIntlProps } from 'react-intl';

const StartPage: React.FunctionComponent<InjectedIntlProps> = (props) => {
  const classes = useStyles(props);
  const { intl } = props;
  return (
    <Grid container spacing={3}>
      <PageTitle>{intl.messages['report.startpage.title']}</PageTitle>
      {getReportPages(intl).map(
        (page, i) =>
          !page.isStartPage && (
            <Grid item container xs={12} md={6} xl={4} key={`page${i}`}>
              {page.disabled && (
                <Grid item container xs={12} md={12} xl={12}>
                  <Divider className={classes.divider} orientation='vertical' flexItem />
                </Grid>
              )}
              <Link to={page.link} className={classes.link}>
                <Card
                  classes={{
                    root: classes.card
                  }}
                >
                  <CardHeader title={page.title} subheader={page.cardSubheader} />
                  <CardContent>
                    {page.disabled && <OverlayBox message={intl.messages['report.comingSoon']} />}
                    <Grid item container xs={12} justify={'center'}>
                      <SVGInline className={classes.svgContainer} svg={page.cardGraphic} />
                    </Grid>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          )
      )}
    </Grid>
  );
};
const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%'
  },
  link: {
    width: '100%',
    textDecoration: 'none'
  },
  svgContainer: {
    width: '100%',
    maxWidth: '80%',
    height: 0,
    paddingTop: '35%' /* Aspect ratio */,
    position: 'relative',

    '& svg': {
      position: 'absolute',
      top: '50%',
      left: 0,
      transform: 'translateY(-50%)'
    }
  },
  snack: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    minWidth: '50px',
    borderRadius: '20px'
  },
  snackLink: {
    textDecoration: 'none'
  },
  divider: {
    height: '2px',
    width: '200%',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.grey.A100
  }
}));

export default injectIntl(StartPage);
