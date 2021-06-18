import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

export interface OwnProps {
  onSave: () => void;
  onCancel: () => void;
  disabledSave?: boolean;
  children?: React.ReactElement;
  className?: string;
}

type DialogFooterProps = InjectedIntlProps & OwnProps;

const useStyles = makeStyles((theme: Theme) => ({
  buttonGroup: {
    '& > button + button': {
      marginLeft: theme.spacing(2)
    }
  }
}));

const DialogFooter: React.FunctionComponent<DialogFooterProps> = (props) => {
  const classes = useStyles(props);
  const { onSave, onCancel, className, intl, children, disabledSave } = props;

  const footerClassName = classNames('dialogFooter', [className]);

  return (
    <div className={footerClassName}>
      {children ? (
        children
      ) : (
        <div className={classes.buttonGroup}>
          <Button onClick={onCancel}>{intl.messages['base.cancel']}</Button>
          <Button variant='contained' color='primary' disabled={disabledSave} onClick={onSave}>
            {intl.messages['base.save']}
          </Button>
        </div>
      )}
    </div>
  );
};

export default injectIntl(DialogFooter);
