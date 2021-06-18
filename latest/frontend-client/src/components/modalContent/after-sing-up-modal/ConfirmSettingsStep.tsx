import { MenuItem, Select, Switch } from '@material-ui/core';
import * as React from 'react';
import { CURRENCIES } from 'utils/number-format';
import { makeStyles } from '@material-ui/core/styles';
import { SettingsState } from 'redux/ducks/settings';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import LanguageSwitcher from 'languageSwitcher';
import HelpText from 'helpText';

const useStyles = makeStyles((theme) => ({
  settingSelector: {
    display: 'flex',
    alignItems: 'center',
    '& label': {
      flex: '0 0 45%',
      marginRight: theme.spacing(2)
    },
    '& + &': {
      marginTop: theme.spacing(1)
    }
  }
}));

export interface ConfirmSettingsStep {
  onChange: (settings: Partial<SettingsState>) => void;
  settings: Partial<SettingsState>;
}

type OwnProps = ConfirmSettingsStep & InjectedIntlProps;

const ConfirmSettingsStep: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const {
    settings: { currency, languageBootstrapData, hasEsmileyScale },
    onChange,
    intl
  } = props;

  return (
    <div>
      <div className={classes.settingSelector}>
        <label htmlFor='currency'>{intl.messages['settings.basic.currency']}</label>
        <Select
          fullWidth
          required={true}
          value={currency}
          name='currency'
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onChange({ currency: event.target.value });
          }}
        >
          {CURRENCIES.map((element: string, index: number) => (
            <MenuItem value={element} key={`currency_${index}`} selected={element === currency}>
              {element}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div className={classes.settingSelector}>
        <label htmlFor='languageBootstrapData'>{'Preferred language'}</label>
        <LanguageSwitcher
          name={'languageBootstrapData'}
          value={languageBootstrapData}
          onChange={(language) => {
            onChange({ languageBootstrapData: language });
          }}
        />
      </div>
      <div className={classes.settingSelector}>
        <label htmlFor='languageBootstrapData'>{intl.messages['settings.hasEsmileyScale']}</label>
        <div id='esmiley-scale-toggle' className='control'>
          <Switch
            color='primary'
            onChange={(e, isEnabled) => {
              onChange({ hasEsmileyScale: isEnabled });
            }}
            checked={hasEsmileyScale}
          />
          <HelpText helpText={intl.messages['help.settings.hasEsmileyScale']} />
        </div>
      </div>
    </div>
  );
};

export default injectIntl(ConfirmSettingsStep);
