import * as React from 'react';
import HelpText from 'components/helpText';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { TextField, IconButton, Button } from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { ProjectAction } from 'redux/ducks/projects';

interface OwnProps {
  actions: ProjectAction[];
  handleActions: (index: number, value: string) => void;
  deleteAction: (index: number) => void;
  addActions: () => void;
}

type ProjectActionsProps = InjectedIntlProps & OwnProps;

const ProjectActions: React.FunctionComponent<ProjectActionsProps> = (props) => {
  const { actions, intl, handleActions, deleteAction, addActions } = props;

  return (
    <div>
      <div className='actions'>
        {actions.map((action: { name: string; id: any }, index) => {
          const inputProps = action.name == '' ? { autoFocus: true } : null;

          return (
            <div className='action' key={`action_${index}`}>
              <TextField
                style={{ display: 'flex', flexGrow: 1 }}
                required={true}
                type='text'
                inputProps={{ maxLength: 255, minLength: 1 }}
                name={`action_${index}`}
                {...inputProps}
                label={intl.messages['project.dialog.actionLabel']}
                value={action.name}
                onChange={(event) => {
                  handleActions(index, event.target.value);
                }}
              />
              <IconButton
                className='removeIcon'
                onClick={() => {
                  deleteAction(index);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          );
        })}
        <div style={{ float: 'right' }}>
          <HelpText helpText={intl.messages['help.project.actions']}>
            <Button startIcon={<AddIcon color='primary' />} onClick={addActions}>
              {intl.messages['project.dialog.actionBtn']}
            </Button>
          </HelpText>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(ProjectActions);
