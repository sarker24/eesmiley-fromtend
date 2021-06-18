import * as React from 'react';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { connect } from 'react-redux';
import ChangeIndicator from './changeIndicator';
import HelpText from 'components/helpText';
import SoundSelector from '../../../components/soundSelector';
import { Select, MenuItem, Switch } from '@material-ui/core';
import * as uiDispatch from 'redux/ducks/ui';
import { getSettings, SavedSettings, SettingsActions, update } from 'redux/ducks/settings';
import { CURRENCIES } from 'utils/number-format';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { Modal, UiActions } from 'redux/ducks/ui';
import './index.scss';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface OwnProps {
  onSubmit: (data: Partial<SavedSettings>) => void;
}

type BasicSettingsProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

const BasicSettings: React.FunctionComponent<BasicSettingsProps> = (props) => {
  const {
    intl,
    updateSettings,
    data,
    data: { enableRegistrationComments },
    onSubmit
  } = props;

  return (
    <div className='basicSettings'>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(data);
        }}
      >
        <div className='field'>
          <label htmlFor='currency'>
            <span>
              <FormattedMessage id='settings.basic.currency' />
            </span>
            <small>{intl.messages[`currency.${data.currency}`]}</small>
          </label>
          <div className='control'>
            <ChangeIndicator
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                onSubmit({ ...data, currency: event.target.value });
              }}
            >
              <Select className='fullWidth' required={true} value={data.currency} name='currency'>
                {CURRENCIES.map((element: string, index: number) => (
                  <MenuItem value={element} key={`currency_${index}`}>
                    {element}
                  </MenuItem>
                ))}
              </Select>
            </ChangeIndicator>
          </div>
          <HelpText helpText={intl.messages['help.settings.primary.currency']} />
        </div>
        <div className='field'>
          <label htmlFor='currency'>
            <span>
              <FormattedMessage id='settings.sound' />
            </span>
          </label>
          <div className='control'>
            <SoundSelector updateSettings={props.updateSettings} />
          </div>
          <HelpText helpText={intl.messages['help.settings.sound']} />
        </div>
        <div className='field'>
          <label htmlFor='useAccountNickname'>
            <span>
              <FormattedMessage id='settings.accounts.displayFormatOfAccountNames' />
            </span>
          </label>
          <div className='control'>
            <ChangeIndicator
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                onSubmit(
                  Object.assign({}, data, { useAccountNickname: event.target.value === 'true' })
                );
              }}
            >
              <Select
                className='fullWidth'
                name='useAccountNickname'
                value={data.useAccountNickname.toString()}
              >
                <MenuItem value={'false'}>
                  {intl.messages['settings.accounts.nameDisplayFormats.company']}
                </MenuItem>
                <MenuItem value={'true'}>
                  {intl.messages['settings.accounts.nameDisplayFormats.nickname']}
                </MenuItem>
              </Select>
            </ChangeIndicator>
          </div>
          <HelpText helpText={intl.messages['help.settings.accountNameFormat']} />
        </div>
        <div className='field'>
          <label htmlFor='registration-comment-toggle'>
            <span>{intl.messages['settings.enableRegistrationComments']}</span>
          </label>
          <div id='registration-comment-toggle' className='control'>
            <Switch
              color='primary'
              onChange={(e, isEnabled) => {
                void updateSettings({ enableRegistrationComments: isEnabled });
              }}
              checked={enableRegistrationComments}
            />
          </div>
          <HelpText helpText={intl.messages['help.settings.enableRegistrationComments']} />
        </div>
      </form>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  data: {
    enableRegistrationComments: getSettings(state).enableRegistrationComments,
    currency: getSettings(state).currency,
    unit: getSettings(state).unit,
    lastUpload: getSettings(state).lastUpload,
    useAccountNickname: getSettings(state).useAccountNickname
  },
  unitList: getSettings(state).unitList
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, UiActions | SettingsActions>
) => ({
  showModal: (modal: Modal) => dispatch(uiDispatch.showModal(modal)),
  updateSettings: (data: Partial<SavedSettings>) => dispatch(update(data))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BasicSettings));
