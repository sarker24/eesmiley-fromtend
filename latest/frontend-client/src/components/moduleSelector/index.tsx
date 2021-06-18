import * as React from 'react';
import { getModuleLinks, getModuleSelectorItems, UiActions } from 'redux/ducks/ui';
import { connect } from 'react-redux';
import ModuleDropdown from 'moduleSelector/moduleDropdown';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type ModuleSelectorContainerProps = StateProps & DispatchProps;

const ModuleSelector: React.FunctionComponent<ModuleSelectorContainerProps> = (props) => {
  const { modules, getModuleSelectorItems } = props;

  React.useEffect(() => {
    if (modules.length === 0) {
      void getModuleSelectorItems();
    }
  }, []);

  return <ModuleDropdown modules={modules} />;
};

const mapStateToProps = (state: RootState) => ({
  modules: getModuleLinks(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<unknown, unknown, UiActions>) => ({
  getModuleSelectorItems: () => dispatch(getModuleSelectorItems())
});

export default connect(mapStateToProps, mapDispatchToProps)(ModuleSelector);
