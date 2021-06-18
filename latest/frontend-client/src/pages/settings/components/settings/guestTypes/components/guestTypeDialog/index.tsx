import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Radio,
  Select,
  Theme,
  Button
} from '@material-ui/core';
import LoadingPlaceholder from 'LoadingPlaceholder';
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { GuestType } from 'redux/ducks/guestTypes/types';
import { GuestTypeSettings, MigrationOps, MigrationStrategy } from 'redux/ducks/settings/types';
import { useState } from 'react';

interface GuestTypeDialogProps extends InjectedIntlProps {
  pendingGuestTypes: NestedPartial<GuestTypeSettings>;
  guestTypes: GuestType[];
  isOpen: boolean;
  isLoading: boolean;

  onClose: () => void;
  onGuestTypeSettingsChange: (arg: GuestTypeSettings) => void;
}

const GuestTypeDialog: React.FunctionComponent<GuestTypeDialogProps> = (props) => {
  const [migrationOp, setMigrationOp] = useState<Partial<MigrationStrategy>>({});

  const classes = styles(props);
  const {
    guestTypes,
    pendingGuestTypes,
    intl,
    isOpen,
    isLoading,
    onClose,
    onGuestTypeSettingsChange
  } = props;
  const { op, value } = migrationOp;
  const canSubmit = MigrationOps[op] && (op !== MigrationOps.useDefault || value);

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    const settings: GuestTypeSettings = {
      enabled: pendingGuestTypes.enabled,
      migrationStrategy: migrationOp as MigrationStrategy
    };

    onGuestTypeSettingsChange(settings);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMigrationOp({ op: MigrationOps.useDefault, value: event.target.value });
  };

  return isLoading ? (
    <Dialog open={isOpen} disableBackdropClick={true} disableEscapeKeyDown={true}>
      <DialogContent className={classes.dialog}>
        <LoadingPlaceholder
          classes={{ title: classes.title }}
          title={intl.messages['settings.processingGuestRegistrations']}
        />
      </DialogContent>
    </Dialog>
  ) : (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{intl.messages['guestMigration.title']}</DialogTitle>
      <Divider />
      <DialogContent>
        <FormControl className={classes.formControl}>
          <FormGroup row={false}>
            <FormControlLabel
              labelPlacement='end'
              label={intl.messages['guestMigration.delete']}
              control={
                <Radio
                  checked={op === MigrationOps.delete}
                  onClick={() => setMigrationOp({ op: MigrationOps.delete })}
                />
              }
            />
            {pendingGuestTypes.enabled ? (
              <FormGroup row={true}>
                <FormControlLabel
                  labelPlacement='end'
                  label={intl.messages['guestMigration.useDefault']}
                  control={
                    <Radio
                      classes={{ root: classes.checkbox, checked: classes.checkbox }}
                      checked={op === MigrationOps.useDefault}
                      onClick={() => setMigrationOp({ op: MigrationOps.useDefault })}
                    />
                  }
                />
                <Select
                  className={classes.select}
                  displayEmpty
                  value={migrationOp.value || ''}
                  disabled={migrationOp.op !== MigrationOps.useDefault}
                  onChange={handleChange}
                >
                  <MenuItem value='' disabled>
                    {intl.messages['base.choose']}
                  </MenuItem>
                  {guestTypes.map((guestType) => (
                    <MenuItem key={guestType.id} value={guestType.id}>
                      {guestType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormGroup>
            ) : (
              <FormControlLabel
                label={intl.messages['guestMigration.nullify']}
                labelPlacement='end'
                control={
                  <Radio
                    classes={{ root: classes.checkbox, checked: classes.checkbox }}
                    checked={op === MigrationOps.nullify}
                    onClick={() => setMigrationOp({ op: MigrationOps.nullify })}
                  />
                }
              />
            )}
          </FormGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{intl.messages['base.cancel']}</Button>
        <Button color='primary' onClick={handleSubmit} disabled={!canSubmit}>
          {intl.messages['base.ok']}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const styles = makeStyles<Theme, GuestTypeDialogProps>({
  checkbox: {
    color: 'rgb(0, 150, 136) !important',
    '&:hover': {
      background: 'rgba(0, 150, 136, 0.08) !important'
    }
  },
  dialog: {
    padding: '0px!important'
  },
  formControl: {
    minWidth: 120
  },
  select: {
    margin: '0!important'
  },
  title: {
    fontSize: '16px'
  }
});

export default injectIntl(GuestTypeDialog);
