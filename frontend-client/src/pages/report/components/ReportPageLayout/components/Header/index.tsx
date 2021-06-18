import { Box, Grid, StyledComponentProps, Theme, Typography } from '@material-ui/core';
import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import Helmet from 'react-helmet';
import Navigation from 'report/components/ReportPageLayout/components/Navigation';
import { useLayoutState } from 'report/utils/pageContext';

interface ComponentProps extends StyledComponentProps {
  disableMenu?: boolean;
}

const Header: React.FunctionComponent<ComponentProps> = (props) => {
  const { disableMenu } = props;
  const classes = useStyles(props);
  const layoutTitle = useLayoutState();

  return (
    <Grid container alignItems={'center'} justify={'space-between'} className={classes.container}>
      <Box clone order={{ xs: 2, sm: 1 }}>
        <Grid item xs={12} sm={4}>
          <Helmet title={layoutTitle} />
          <Typography variant={'h1'} align={'center'} className={classes.pageHeadline}>
            {layoutTitle}
          </Typography>
        </Grid>
      </Box>
      <Box clone order={{ xs: 1, sm: 2 }} mb={{ xs: 2, sm: 0 }}>
        <Grid
          item
          container
          xs={12}
          sm={4}
          alignItems={'center'}
          justify={'flex-end'}
          className={classes.reportSwitch}
        >
          {!disableMenu && <Navigation />}
        </Grid>
      </Box>
    </Grid>
  );
};

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    margin: theme.spacing(1.5, 0, 3),

    '&:before': {
      content: '""',
      flex: 1
    }
  },
  pageHeadline: {
    marginTop: theme.spacing(0.5)
  },
  reportSwitch: {
    [theme.breakpoints.up('sm')]: {
      flex: 1
    }
  }
}));

export default Header;
