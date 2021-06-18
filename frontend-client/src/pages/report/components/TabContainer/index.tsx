import * as React from 'react';
import { StyledTabs, StyledTab } from './components/StyledTabs';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Icon } from 'icon';
import scaleImage from 'static/icons/balance-scale.svg';
import guestsImage from 'static/icons/guests.svg';

interface ComponentProps extends InjectedIntlProps {
  onTabChange: (value: string) => void;
  children: React.ReactElement;
  initialValue?: string;
}

// todo refactor or rename to something else, not generic ui component with hardcoded labels
const TabContainer: React.FunctionComponent<ComponentProps> = (props) => {
  const { initialValue, onTabChange, children, intl } = props;
  const [value, setValue] = React.useState(initialValue || 'total');

  React.useEffect(() => {
    if (value !== initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const handleChange = (event: React.ChangeEvent, newValue: string) => {
    setValue(newValue);
    onTabChange(newValue);
  };

  return (
    <>
      <StyledTabs value={value} onChange={handleChange}>
        <StyledTab
          label={intl.messages['report.totalFoodwaste.title']}
          icon={<Icon icon={scaleImage} />}
          value='total'
        />
        <StyledTab
          label={intl.messages['report.foodwaste.perGuest.title']}
          icon={<Icon icon={guestsImage} />}
          value='per-guest'
        />
      </StyledTabs>
      {children}
    </>
  );
};

export default injectIntl(TabContainer);
