import * as React from 'react';
import { RootState } from 'redux/rootReducer';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { setStepAnchor, resetStep } from 'redux/ducks/tutorials';
import classNames from 'classnames';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export interface StepAnchorProps {
  classes?: { active?: string };
  tutorialId: string;
  step: number;
  children: React.ReactElement;
  disableCloseOnClick?: boolean;
}

type OwnProps = StateProps & DispatchProps & StepAnchorProps;

const useStyles = makeStyles({
  activeStep: {
    opacity: 1,
    zIndex: 2000,
    backgroundColor: 'white'
  }
});

const StepAnchor: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const {
    isActive,
    setStepAnchor,
    resetStep,
    classes: classesProp = {},
    children: child,
    disableCloseOnClick = false
  } = props;
  const anchorRef = React.useRef<HTMLElement>(null);

  const handleClick = (onClickCallback: (e: React.MouseEvent) => void) => (e: React.MouseEvent) => {
    if (onClickCallback) {
      onClickCallback(e);
    }
    if (!disableCloseOnClick) {
      resetStep();
    }
  };
  React.useEffect(() => {
    const className = classNames(classes.activeStep, classesProp.active);
    if (anchorRef.current) {
      if (!anchorRef.current.classList) {
        console.warn('[StepAnchor]: Ref must a DOM element!');
        return;
      }

      if (isActive) {
        anchorRef.current.classList.add(className);
        setStepAnchor(anchorRef.current);
      } else if (!isActive) {
        anchorRef.current.classList.remove(className);
      }
    }
  }, [isActive, anchorRef]);

  // 1st version: override any existing ref
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return React.cloneElement(child, { ref: anchorRef, onClick: handleClick(child.props.onClick) });
};

const mapStateToProps = (state: RootState, props: StepAnchorProps) => ({
  isActive: state.tutorials.tutorialId === props.tutorialId && state.tutorials.step === props.step
});

const mapDispatchToProps = { setStepAnchor, resetStep };

export default connect(mapStateToProps, mapDispatchToProps)(StepAnchor);
