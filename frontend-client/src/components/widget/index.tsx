import * as React from 'react';
import Container from 'components/container';
import { connect } from 'react-redux';
import * as widgetDispatch from 'redux/ducks/widgets';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import WidgetSettingsButton from './components/widgetSettingsButton';
import './index.scss';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { WidgetActions } from 'redux/ducks/widgets/types';

interface StateProps {
  hasInitializedSettings: boolean;
  editMode: boolean;
}

interface DispatchProps {
  setEditMode: (id: string, editMode: boolean) => void;
}

interface OwnProps {
  renderEditing?: any;
  setActiveWidget?: any;
  activeWidgets?: React.ReactElement[];
  title?: string;
  editingTitle?: string;
  id: string;
  renderEmptyPlaceholder?: () => React.ReactElement | React.ReactElement[];
  editFormComponent?: React.ComponentClass<any>;
  className?: string;
  children: React.ReactElement | React.ReactElement[];
  onMouseEnter?: any;
  onMouseLeave?: any;
}

type WidgetProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class Widget extends React.Component<WidgetProps> {
  buttonRef: React.RefObject<any>;

  constructor(props) {
    super(props);
    this.buttonRef = React.createRef();
  }

  renderContent(content: React.ReactElement | React.ReactElement[]) {
    const { setEditMode, editFormComponent: EditComponent, editMode, id } = this.props;
    return editMode && EditComponent ? (
      <EditComponent
        setEditMode={(editMode: boolean, hasSaved?: boolean, encounteredError?: boolean) => {
          setEditMode(id, editMode);
          if (hasSaved) {
            // to figure out: refs with injectIntl HoC
            // eslint-disable-next-line
            this.buttonRef.current.showWidgetSettingsNotification(encounteredError);
          }
        }}
      />
    ) : (
      content
    );
  }

  render() {
    const {
      className,
      children,
      setEditMode,
      editFormComponent,
      editMode,
      id,
      title,
      intl,
      hasInitializedSettings,
      editingTitle,
      renderEmptyPlaceholder,
      ...rest
    } = this.props;
    const settingsButton = editFormComponent && hasInitializedSettings && (
      <WidgetSettingsButton
        editMode={editMode}
        setEditMode={setEditMode}
        id={id}
        ref={this.buttonRef}
      />
    );

    const placeholder = renderEmptyPlaceholder && renderEmptyPlaceholder();

    if (placeholder) {
      return (
        <div
          className={
            'widget container ' +
            (placeholder ? 'placeholder ' : '') +
            (className ? className : '') +
            (editMode ? ' editingMode' : '')
          }
        >
          <div className='placeholderInner'>
            {settingsButton}
            {this.renderContent(placeholder)}
          </div>
        </div>
      );
    }

    return (
      <Container
        {...rest}
        className={
          'widget ' +
          (!placeholder ? 'container ' : 'placeholder ') +
          (className ? className : '') +
          (editMode ? ' editingMode' : '')
        }
        title={placeholder ? null : editMode && editingTitle ? editingTitle : title}
      >
        {settingsButton}
        {this.renderContent(children)}
      </Container>
    );
  }
}

const mapStateToProps = (state: RootState, { id }: WidgetProps) => ({
  hasInitializedSettings: !state.settings.isInitial,
  editMode: state.widgets.editing[id] != undefined ? state.widgets.editing[id] : false
});

const mapDispatchToProps = (dispatch: ThunkDispatch<unknown, unknown, WidgetActions>) => ({
  setEditMode: (id: string, editMode: boolean) =>
    dispatch(widgetDispatch.setWidgetEditMode(id, editMode))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Widget));
