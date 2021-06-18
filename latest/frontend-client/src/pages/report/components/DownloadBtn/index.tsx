import * as React from 'react';
import { Button, Theme } from '@material-ui/core';
import Download from 'icons/download';
import { makeStyles } from '@material-ui/core/styles';
import { injectIntl, InjectedIntlProps } from 'react-intl';

interface ComponentProps extends InjectedIntlProps {
  onClick: () => void;
  isDownloading: boolean;
}

const DownloadBtn: React.FunctionComponent<ComponentProps> = (props) => {
  const { onClick, isDownloading } = props;
  const classes = useStyles(props);
  const { intl } = props;

  return (
    <Button
      variant='contained'
      classes={{ root: classes.root }}
      color={isDownloading ? 'primary' : undefined}
      startIcon={<Download viewBox={'0 0 512 512'} className={classes.icon} />}
      onClick={onClick}
    >
      {isDownloading ? intl.messages['report.generatingPDF'] : intl.messages['report.downloadPDF']}
    </Button>
  );
};

const useStyles = makeStyles<Theme>((theme) => ({
  root: ({ isDownloading }: ComponentProps) => ({
    zIndex: 999,
    color: theme.palette.common.white,
    background: !isDownloading && theme.palette.grey.A100,
    borderRadius: 2,
    position: 'fixed',
    bottom: theme.spacing(4),
    padding: '8px 14px 8px 8px',
    right: 0,
    transform: 'translate(calc(100% - 42px), 0)',
    transition:
      'transform 250ms cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 250ms cubic-bezier(0.165, 0.84, 0.44, 1)',

    '&:hover': {
      transform: 'translate(0, 0)'
    }
  }),
  icon: {
    fill: theme.palette.common.white,
    width: 15,
    marginLeft: 10,
    marginRight: 7,
    height: 15
  }
}));

export default injectIntl(DownloadBtn);
