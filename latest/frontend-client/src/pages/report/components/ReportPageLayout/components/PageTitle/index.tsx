import * as React from 'react';
import { useLayoutDispatch } from 'report/utils/pageContext';

export interface PageTitleProps {
  children: string;
}

const PageTitle: React.FunctionComponent<PageTitleProps> = (props) => {
  const { children: title } = props;
  const dispatchTitle = useLayoutDispatch();

  React.useEffect(() => {
    dispatchTitle(title);
  }, [title]);

  return null;
};

export default PageTitle;
