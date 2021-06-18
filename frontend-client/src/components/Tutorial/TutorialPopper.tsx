import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Backdrop,
  Card,
  CardContent,
  IconButton,
  Paper,
  Popper,
  Typography
} from '@material-ui/core';
import { RootState } from 'redux/rootReducer';
import { resetStep } from 'redux/ducks/tutorials';
import { connect } from 'react-redux';
import CloseIcon from '@material-ui/icons/Close';

// should replace mui/popper with react-popper later on,
// or figure out way to center arrow against the reference element
const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: 1400,
    color: '#fff'
  },
  popper: {
    zIndex: 2000,
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${theme.palette.background.paper} transparent`
      }
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${theme.palette.background.paper} transparent transparent transparent`
      }
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      top: 10,
      marginLeft: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${theme.palette.background.paper} transparent transparent`
      }
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${theme.palette.background.paper}`
      }
    }
  },
  arrow: {
    position: 'absolute',
    fontSize: 7,
    width: '3em',
    height: '3em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid'
    }
  },
  paper: {
    maxWidth: 460,
    overflow: 'auto'
  },
  cardHeader: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardContent: {
    // \n into newline
    whiteSpace: 'pre-line'
  }
}));

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type OwnProps = StateProps & DispatchProps;

const TutorialPopper: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const { anchorEl, title, content, onClose } = props;

  return (
    <div>
      <Popper
        className={classes.popper}
        modifiers={{
          flip: { enabled: true },
          preventOverflow: { enabled: true, boundariesElement: 'scrollParent' },
          offset: { enabled: true, offset: '0,10' },
          arrow: {
            enabled: true,
            element: classes.arrow
          }
        }}
        placement='right-start'
        open={!!anchorEl}
        anchorEl={anchorEl}
        transition
      >
        <div className={classes.arrow} x-arrow='true' />
        <Paper className={classes.paper}>
          <Card>
            <div className={classes.cardHeader}>
              <Typography variant='h2' component='h3'>
                {title}
              </Typography>
              <IconButton size='small' onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </div>
            <CardContent className={classes.cardContent}>{content}</CardContent>
          </Card>
        </Paper>
      </Popper>
      <Backdrop className={classes.backdrop} open={!!anchorEl} onClick={onClose} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  anchorEl: state.tutorials.stepAnchorEl,
  title: state.tutorials.title,
  content: state.tutorials.content
});

const mapDispatchToProps = { onClose: resetStep };
export default connect(mapStateToProps, mapDispatchToProps)(TutorialPopper);
