import * as React from 'react';
import AfterSignUpModal from '../../../../components/modalContent/after-sing-up-modal';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import { SettingsState } from 'redux/ducks/settings';

interface OwnProps {
  settings: Partial<SettingsState>;
}

type AfterSignUpPopUpWrapperProps = InjectedIntlProps & OwnProps;
/**
 * Simple wrapper for a Dialog shown in the front page, used as an alternative to redux/ducks/ui/index/showModal
 * since it doesn't cause a re-render of the whole page
 */
const TitleKeys = [
  'dashboard.afterSignUpModal.settings_title',
  'dashboard.afterSignUpModal.bootstrap_title'
];
const AfterSignUpPopUpWrapper: React.FunctionComponent<AfterSignUpPopUpWrapperProps> = (props) => {
  const { settings, intl } = props;
  const [open, setOpen] = React.useState<boolean>(true);
  const [step, setStep] = React.useState<0 | 1>(0);

  const handleClose = () => {
    setOpen(false);
  };

  const titleKey = TitleKeys[step];

  return (
    !settings.isInitial &&
    settings.firstTimeNoSettings && (
      <Dialog open={open} className='afterSignUpModal' fullWidth>
        <DialogTitle>{intl.messages[titleKey]}</DialogTitle>
        <DialogContent>
          <AfterSignUpModal onClose={handleClose} step={step} onStepChange={setStep} />
        </DialogContent>
      </Dialog>
    )
  );
};

export default injectIntl(AfterSignUpPopUpWrapper);
