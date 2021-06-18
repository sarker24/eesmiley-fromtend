import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle as MuiDialogTitle,
  DialogTitleProps as MuiDialogTitleProps,
  IconButton,
  Typography
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

export interface SuccessModalProps {
  badgeIcon?: React.ReactElement;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  bodyTitle?: React.ReactNode;
  footer?: React.ReactNode;
  timeoutInMs?: number;
  open: boolean;
  onClose?: () => void;
}

export interface DialogTitleProps extends MuiDialogTitleProps {
  subtitle?: React.ReactNode;
  badgeIcon?: React.ReactElement<{ className?: string }>;
  onClose: () => void;
}

const badgeWidth = 50;

const useStyles = makeStyles((theme) => ({
  root: {
    overflowY: 'visible',
    paddingBottom: theme.spacing(3)
  },
  title: {
    margin: 0,
    display: 'flex',
    alignItems: 'baseline'
  },
  subtitle: {
    marginLeft: theme.spacing(2),
    fontSize: '0.8rem',
    fontWeight: 'normal'
  },
  titleWithBadge: {
    marginLeft: badgeWidth
  },
  titleText: {
    fontSize: '1rem',
    fontWeight: 800
  },
  content: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center'
  },
  value: {
    // this should match dashboard card metric value
    fontWeight: 800,
    fontSize: '26px',
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center'
  },
  name: {
    // this should match dashboard card metric title
    fontSize: '18px',
    opacity: 0.9,
    fontWeight: 600,
    marginTop: theme.spacing(0.8)
  },
  date: {
    marginLeft: theme.spacing(2),
    fontSize: '0.8rem',
    fontWeight: 'normal'
  },
  footer: {
    marginTop: theme.spacing(3)
  },
  closeButton: {
    marginLeft: 'auto',
    color: theme.palette.grey[500]
  },
  badge: {
    color: '#ffcf31',
    width: '120px',
    height: '120px',
    position: 'absolute',
    top: -badgeWidth,
    left: -badgeWidth,
    animation: '$rotation 32s infinite linear'
  },
  '@keyframes rotation': {
    '0%': {
      transform: 'rotate(0deg)'
    },
    '100%': {
      transform: 'rotate(359deg)'
    }
  }
}));

const DialogTitle: React.FunctionComponent<DialogTitleProps> = (props) => {
  const classes = useStyles(props);
  const { children, subtitle, badgeIcon, onClose, ...other } = props;
  return (
    <MuiDialogTitle
      disableTypography
      className={classNames(classes.title, { [classes.titleWithBadge]: !!badgeIcon })}
      {...other}
    >
      {badgeIcon &&
        React.cloneElement(badgeIcon, {
          ...badgeIcon.props,
          className: classNames(classes.badge, badgeIcon.props.className)
        })}
      <Typography variant='h6' className={classes.titleText}>
        {children}
      </Typography>
      {subtitle && (
        <Typography variant='subtitle1' className={classes.subtitle}>
          {subtitle}
        </Typography>
      )}
      <IconButton aria-label='close' className={classes.closeButton} size='small' onClick={onClose}>
        <CloseIcon fontSize='small' />
      </IconButton>
    </MuiDialogTitle>
  );
};

const SuccessModal: React.FunctionComponent<SuccessModalProps> = (props) => {
  const classes = useStyles(props);
  const { badgeIcon, title, subtitle, bodyTitle, footer, open, onClose, children } = props;
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' classes={{ paper: classes.root }}>
      <DialogTitle badgeIcon={badgeIcon} onClose={onClose} subtitle={subtitle}>
        {title}
      </DialogTitle>
      <DialogContent className={classes.content}>
        {children}
        {bodyTitle && <Typography className={classes.name}>{bodyTitle}</Typography>}
        {footer && <div className={classes.footer}>{footer}</div>}
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
