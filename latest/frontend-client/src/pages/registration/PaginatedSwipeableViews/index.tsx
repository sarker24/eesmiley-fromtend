import { MobileStepper, IconButton } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import * as React from 'react';
import { StyleRules, withStyles } from '@material-ui/core/styles';
import { CSSTransitionGroup } from 'react-transition-group';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { updatePagination } from 'redux/ducks/registration';
import { RootState } from 'redux/rootReducer';

interface IComponentProps {
  classes: { [name: string]: string };
  children: React.ReactElement[];
  updatePagination: (pageNumber: number) => void;
  pageNumber: number;
}

const PaginatedSwipeableViews = ({
  classes,
  children: pages,
  pageNumber,
  updatePagination
}: IComponentProps) => {
  // In the event that the page gets resized, and the tiles get moved to the previous page leaving the current page blank,
  // update the pagination to the previous page
  if (pageNumber !== 0 && pageNumber >= pages.length) {
    updatePagination(pageNumber - 1);
  }

  return (
    <div>
      {pageNumber > 0 && (
        <IconButton
          className={`${classes.button} ${classes.leftButton}`}
          onClick={() => updatePagination(pageNumber - 1)}
        >
          <ChevronLeftIcon />
        </IconButton>
      )}
      {pageNumber < pages.length - 1 && (
        <IconButton
          className={`${classes.button} ${classes.rightButton}`}
          onClick={() => updatePagination(pageNumber + 1)}
        >
          <ChevronRightIcon />
        </IconButton>
      )}
      <CSSTransitionGroup
        transitionName='fade'
        transitionLeaveTimeout={250}
        transitionEnterTimeout={500}
      >
        {pages[pageNumber]}
      </CSSTransitionGroup>
      {pages.length > 1 && (
        <MobileStepper
          classes={{
            root: classes.stepper,
            dotActive: classes.dotActive
          }}
          variant='dots'
          steps={pages.length}
          position='static'
          activeStep={pageNumber}
          backButton={<div />}
          nextButton={<div />}
        />
      )}
    </div>
  );
};

const styles: StyleRules = {
  button: {
    position: 'absolute !important' as 'absolute',
    top: 'calc(50% - 12px)',
    cursor: 'pointer',
    background: 'white !important',
    borderRadius: 40,
    boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
    transform: 'translateY(-50%)',
    zIndex: 2
  },
  leftButton: {
    left: 4
  },
  rightButton: {
    right: 4
  },
  stepper: {
    background: 'transparent',
    justifyContent: 'center'
  },
  dotActive: {
    backgroundColor: '#009688' //FIXME
  }
};

export default compose(
  withStyles(styles),
  connect(
    (state: RootState) => ({
      pageNumber: state.registration.pageNumber
    }),
    (dispatch) => ({
      updatePagination: (pageNumber) => dispatch(updatePagination(pageNumber))
    })
  )
)(PaginatedSwipeableViews) as React.ComponentType;
