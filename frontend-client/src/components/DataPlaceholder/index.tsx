import { Fab, Typography } from '@material-ui/core';
import * as React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import './index.scss';

interface DataPlaceholderProps {
  className?: string;
  title: string;
  description?: string | JSX.Element;
  buttonHandler?: () => any;
  buttonIcon?: JSX.Element;
}

const DataPlaceholder: React.FunctionComponent<DataPlaceholderProps> = (
  props: DataPlaceholderProps
) => {
  const { className, title, description, buttonIcon, buttonHandler } = props;

  const classes = useStyles(props);

  return (
    <div
      className={classNames('placeholder', classes.container, {
        [className]: !!className
      })}
    >
      {buttonHandler && (
        <Fab color='primary' onClick={buttonHandler}>
          {buttonIcon}
        </Fab>
      )}
      <Typography variant='h1' className={classes.title}>
        {title}
      </Typography>
      <div className={classes.description}>{description}</div>
    </div>
  );
};

const useStyles = makeStyles(
  {
    container: {
      backgroundColor: '#eeeeee',
      display: 'flex',
      padding: 24,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      fontWeight: 600,
      textShadow: '0px 0px 2px rgba(34, 34, 34, 0.3)',
      marginTop: '2em !important'
    },
    description: {
      textAlign: 'center',
      marginTop: '2em !important'
    }
  },
  { name: 'DataPlaceholder' }
);

export default DataPlaceholder;
