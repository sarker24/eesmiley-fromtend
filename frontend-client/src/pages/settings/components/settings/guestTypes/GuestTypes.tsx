import HelpText from 'helpText';
import * as React from 'react';
import { FunctionComponent } from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { CreateGuestType, GuestType } from 'redux/ducks/guestTypes/types';
import GuestTypeTable from './components/guestTypeTable';
import { FormControlLabel, makeStyles, Switch } from '@material-ui/core';
import classNames from 'classnames';

interface OwnProps {
  hasGuestTypesEnabled: boolean;
  hasGuestRegistrationFlowEnabled: boolean;
  guestTypes: GuestType[];

  onToggleGuestRegistrationFlow: (hasGuestFlowEnabled: boolean) => void;
  onToggleGuestTypes: (hasGuestTypesEnabled: boolean) => void;
  onDelete: (guestType: GuestType) => void;
  onUpdate: (guestType: GuestType) => void;
  onCreate: (guestType: CreateGuestType) => void;
}

type GuestTypesProps = InjectedIntlProps & OwnProps;

export const GuestTypes: FunctionComponent<GuestTypesProps> = ({
  intl,
  onToggleGuestRegistrationFlow,
  onToggleGuestTypes,
  hasGuestTypesEnabled,
  guestTypes,
  hasGuestRegistrationFlowEnabled,
  onDelete,
  onUpdate,
  onCreate
}) => {
  const classes = useStyles({});

  return (
    <div className='setting'>
      <div className={classes.toggle}>
        <HelpText helpText={intl.messages['settings.enableGuestRegistrationFlowDescription']}>
          &nbsp;
        </HelpText>
        <FormControlLabel
          control={
            <Switch
              color={'primary'}
              checked={hasGuestRegistrationFlowEnabled}
              style={{
                display: 'inline-block',
                width: 'auto'
              }}
              onChange={(e, isInputChecked) => {
                onToggleGuestRegistrationFlow(isInputChecked);
              }}
            />
          }
          label={intl.messages['settings.enableGuestRegistrationFlow']}
        />
      </div>
      <div
        className={classNames(classes.fullWidth, {
          [classes.disabled]: !hasGuestRegistrationFlowEnabled
        })}
      >
        <div className={classes.toggle}>
          <HelpText helpText={intl.messages['settings.enableGuestTypesDescription']}>
            &nbsp;
          </HelpText>
          <FormControlLabel
            control={
              <Switch
                disabled={!hasGuestRegistrationFlowEnabled || guestTypes.length === 0}
                color={'primary'}
                checked={hasGuestTypesEnabled}
                style={{
                  display: 'inline-block',
                  width: 'auto'
                }}
                onChange={(e, isInputChecked) => {
                  e.preventDefault();
                  if (!hasGuestRegistrationFlowEnabled || guestTypes.length === 0) {
                    return;
                  }
                  onToggleGuestTypes(isInputChecked);
                }}
              />
            }
            label={intl.messages['settings.enableGuestTypes']}
          />
        </div>
        <GuestTypeTable
          guestTypes={guestTypes}
          onDelete={onDelete}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
};

const useStyles = makeStyles({
  toggle: {
    width: '100%'
  },
  disabled: {
    position: 'relative',
    opacity: 0.4,
    pointerEvents: 'none'
  },
  fullWidth: {
    width: '100%'
  }
});

export default injectIntl(GuestTypes);
