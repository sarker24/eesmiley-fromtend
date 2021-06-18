import { Typography, TypographyProps } from '@material-ui/core';
import * as React from 'react';
import withLoading, { WithLoadingProps } from 'LoadingPlaceholder/withLoading';
import { PropsWithChildren } from 'react';

export type ChartTitleProps<C extends React.ElementType> = TypographyProps<C, { component?: C }> &
  WithLoadingProps;

// cant use React.FunctionComponent for generics, see
// https://wanago.io/2020/03/09/functional-react-components-with-generic-props-in-typescript/
const ChartTitle = <C extends React.ElementType>({
  children,
  isLoading,
  ...rest
}: PropsWithChildren<ChartTitleProps<C>>) => <Typography {...rest}>{children}</Typography>;

export default withLoading(ChartTitle);
