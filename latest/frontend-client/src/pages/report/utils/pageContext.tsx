import * as React from 'react';

type LayoutState = string;
type Dispatch = (state: LayoutState) => void;

type LayoutProviderProps = { children: React.ReactNode };
const LayoutStateContext = React.createContext<LayoutState>(undefined);
const LayoutDispatchContext = React.createContext<Dispatch>(undefined);

function LayoutProvider({ children }: LayoutProviderProps) {
  const [title, setTitle] = React.useState<LayoutState>(null);

  return (
    <LayoutStateContext.Provider value={title}>
      <LayoutDispatchContext.Provider value={setTitle}>{children}</LayoutDispatchContext.Provider>
    </LayoutStateContext.Provider>
  );
}

function useLayoutState() {
  const context = React.useContext(LayoutStateContext);
  if (context === undefined) {
    throw new Error('useLayoutState must be used within a LayoutProvider');
  }
  return context;
}

function useLayoutDispatch() {
  const context = React.useContext(LayoutDispatchContext);
  if (context === undefined) {
    throw new Error('useLayoutDispatch must be used within a LayoutProvider');
  }
  return context;
}

function useLayout() {
  return [useLayoutState(), useLayoutDispatch()];
}

export { LayoutProvider, useLayout, useLayoutState, useLayoutDispatch };
