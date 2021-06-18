import * as React from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { CSSTransitionGroup } from 'react-transition-group';
import reportTheme from 'styles/themes/reports';
import { withRouter, WithRouterProps } from 'react-router';
import { LayoutProvider } from 'pages/report/utils/pageContext';
import ReportPageLayout from 'pages/report/components/ReportPageLayout';

export interface ReportContainerProps {
  children: React.ReactElement & { getLayout?: (page) => React.ReactElement };
}

type OwnProps = WithRouterProps & ReportContainerProps;

const indexPageRegex = /\/report\/?$/;

const ReportContainer: React.FunctionComponent<OwnProps> = (props) => {
  const {
    children,
    location: { pathname }
  } = props;
  const classes = useStyles(props);
  const isIndexPage = !!indexPageRegex.exec(pathname);

  return (
    <ThemeProvider theme={(outerTheme) => ({ ...outerTheme, ...reportTheme })}>
      <LayoutProvider>
        <CSSTransitionGroup
          component={React.Fragment}
          transitionName={{
            enter: classes.enter,
            enterActive: classes.enterActive,
            appear: classes.appear,
            appearActive: classes.appearActive,
            leave: classes.leave,
            leaveActive: classes.leaveActive
          }}
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnter={false}
          transitionLeave={false}
        >
          <ReportPageLayout disableMenu={isIndexPage}>{children}</ReportPageLayout>
        </CSSTransitionGroup>
      </LayoutProvider>
    </ThemeProvider>
  );
};

const useStyles = makeStyles({
  appear: {
    opacity: 0.01
  },
  appearActive: {
    opacity: 1,
    transition: 'opacity 500ms ease-out'
  },
  enter: {
    opacity: 0.01
  },
  enterActive: {
    opacity: 1,
    transition: 'opacity 500ms ease-out'
  },
  leave: {
    opacity: 1
  },
  leaveActive: {
    opacity: 0.01,
    transition: 'opacity 300ms ease-out'
  }
});

export default withRouter(ReportContainer);
