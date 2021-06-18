import * as React from 'react';
import { Box } from '@material-ui/core';
import Header from 'report/components/ReportPageLayout/components/Header';
import FilterHeader from 'report/components/FilterHeader';
import { RootState } from 'redux/rootReducer';
import { connect } from 'react-redux';
import LoadingPlaceHolder from 'LoadingPlaceholder';
import { makeStyles } from '@material-ui/styles';

export { default as PageTitle } from './components/PageTitle';

interface PageProps {
  children: React.ReactElement | React.ReactElement[];
  disableMenu?: boolean;
}

type StateProps = ReturnType<typeof mapStateToProps>;
type OwnProps = StateProps & PageProps;

const useStyles = makeStyles({
  spinner: {
    margin: '0 -32px'
  }
});

const ReportPageLayout: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const { children, disableMenu, isFilterInitialized } = props;

  return (
    <>
      {!disableMenu && <FilterHeader />}
      <Box px={2} mb={3}>
        <Header disableMenu={disableMenu} />
        {disableMenu || isFilterInitialized ? (
          children
        ) : (
          <LoadingPlaceHolder className={classes.spinner} />
        )}
      </Box>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  isFilterInitialized: state.newReports.isInitialized
});

export default connect<StateProps, unknown, PageProps>(mapStateToProps)(ReportPageLayout);
