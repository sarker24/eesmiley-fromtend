import BootstrapSelector, { BootstrapTemplate } from './BootstrapSelector';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { SavedSettings } from 'redux/ducks/settings';

export interface BootstrapDataStepProps {
  settings: Partial<SavedSettings>;
  onChange: (settings: Partial<SavedSettings>) => void;
}

type OwnProps = BootstrapDataStepProps & InjectedIntlProps;

const BootstrapDataStep: React.FunctionComponent<OwnProps> = (props) => {
  const { settings, onChange, intl } = props;

  const handleChange = (template: BootstrapTemplate) => {
    onChange({ bootstrapTemplateId: template.id });
  };

  return (
    <div>
      <p>{intl.messages['dashboard.afterSignUpModal.subtitle']}</p>
      <p>{intl.messages['dashboard.afterSignUpModal.description']}</p>
      <BootstrapSelector selected={settings.bootstrapTemplateId} onChange={handleChange} />
    </div>
  );
};

export default injectIntl(BootstrapDataStep);
