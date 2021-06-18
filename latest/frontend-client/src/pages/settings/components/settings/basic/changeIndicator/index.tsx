import * as React from 'react';

import './index.scss';
import CheckIcon from '@material-ui/icons/Check';
import classNames from 'classnames';
import { Fade } from '@material-ui/core';

interface ChangeIndicatorProps {
  onChange: (e: React.ChangeEvent, child: React.ReactNode) => void;
  children: React.ReactElement;
  className?: string;
}

const TimeOutConfig = {
  appear: 900,
  enter: 900,
  exit: 300
};

const ChangeIndicator: React.FunctionComponent<ChangeIndicatorProps> = (props) => {
  const { className, children, onChange, ...rest } = props;
  const [enabled, setEnabled] = React.useState<boolean>(false);

  React.useEffect(() => {
    let timeout;
    if (enabled) {
      timeout = setTimeout(() => {
        setEnabled(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [enabled]);

  const handleChange = (e: React.ChangeEvent, child: React.ReactNode) => {
    onChange(e, child);
    setEnabled(true);
  };

  return (
    <div className={classNames('changeIndicator', { [className]: Boolean(className) })}>
      {React.cloneElement(children, { onChange: handleChange, ...rest })}
      <Fade in={enabled} timeout={TimeOutConfig}>
        <div className={classNames('changeIndicatorIcon')}>
          <CheckIcon />
        </div>
      </Fade>
    </div>
  );
};

export default ChangeIndicator;
