//THIS IS TO DEFINE MODULES THAT HAVE NO TYPES DEFINED (@types or elsewhere...)

declare module 'jsontokens' {}

declare module 'react-hot-loader' {
  import * as React from 'react';

  interface AppContainerProps {
    children?: React.ReactElement;
  }

  export class AppContainer extends React.Component<AppContainerProps> {}
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare type ClassesOverride<UseStyles extends (props: any) => Record<string, string>> = Partial<
  Record<keyof ReturnType<UseStyles>, string>
>;

declare type NestedPartial<T> = {
  [P in keyof T]?: NestedPartial<T[P]>;
};

declare interface Window {
  // scale app > v2.0.0 injects global flag
  isScaleApp: boolean;
  ReactNativeWebView: {
    postMessage: (message: string) => void;
  };
  sysvars: {
    API_URL: string;
    LEGACY_API_URL: string;
    HELP_URL: string;
    STATS_URL: string;
  };
}
