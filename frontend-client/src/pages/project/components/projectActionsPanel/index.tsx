import * as React from 'react';
import './index.scss';
import ProjectActions from './components/projectActions';
import { onSubmitForm } from 'utils/helpers';
import { Button } from '@material-ui/core';
import { Project } from 'redux/ducks/projects';
import { InjectedIntlProps, injectIntl } from 'react-intl';

interface IComponentProps extends InjectedIntlProps {
  project: Project;
  toggleActionsPanel: (mode?: string) => void;
  updateProject: (args: {
    project: Project;
    patch: { op: string; path: string; value: any }[];
    reloadTimeline?: boolean;
    updateParent?: boolean;
  }) => Promise<void>;
}

interface IComponentState {
  project: Project;
}

class ProjectActionsPanel extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      project: {} as Project
    };
  }

  // FIXME (Florin) Find a way to generalize the handle methods in the ProjectActionsPanel, so we don't repeat it so many times
  handleActions = (index: number, values: string) => {
    const nextActions = this.state.project.actions.map((p, i) =>
      i === index ? { ...p, name: values } : p
    );
    this.setState((prevState) => ({
      project: { ...prevState.project, actions: nextActions }
    }));
  };

  deleteActions = (index: number) => {
    const nextActions = this.state.project.actions.filter((_, i) => i !== index);
    this.setState((prevState) => ({
      project: { ...prevState.project, actions: nextActions }
    }));
  };

  addActions = () => {
    const nextActions = [...this.state.project.actions, { name: '' }];
    this.setState((prevState) => ({
      project: { ...prevState.project, actions: nextActions }
    }));
  };

  UNSAFE_componentWillMount() {
    if (this.props.project) {
      this.setState({
        project: this.props.project
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: IComponentProps) {
    if (nextProps.project) {
      this.setState({
        project: nextProps.project
      });
    }
  }

  saveHandler = () => {
    const { project } = this.state;
    const { updateProject, toggleActionsPanel } = this.props;
    const filteredActions = project.actions.filter(
      (action) => action.name !== '' && action.name != undefined
    );

    const patch = [
      {
        op: 'replace',
        path: '/actions',
        value: filteredActions
      }
    ];

    void updateProject({
      project,
      patch,
      reloadTimeline: true,
      updateParent: true
    });
    toggleActionsPanel();
  };

  render() {
    const { intl, toggleActionsPanel } = this.props;
    const { project } = this.state;

    if (project == null) {
      return null;
    }

    return (
      <div className='projectActionsPanel'>
        <form onSubmit={onSubmitForm(this.saveHandler)}>
          {project.status === 'PENDING_INPUT' && (
            <div className='projectActions'>
              <p className='actionsLabel'>{intl.messages['complete_task.corrective_actions']}</p>
              <ProjectActions
                actions={project.actions}
                handleActions={this.handleActions}
                deleteAction={this.deleteActions}
                addActions={this.addActions}
              />
            </div>
          )}
          <div className='editModalControllers'>
            <Button
              onClick={() => {
                toggleActionsPanel('cancel');
              }}
            >
              {intl.messages['base.cancel']}
            </Button>
            <Button variant={'contained'} color='primary' type='submit'>
              {intl.messages['base.save']}
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

export default injectIntl(ProjectActionsPanel);
