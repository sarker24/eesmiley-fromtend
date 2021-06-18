import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import DropDownSelector from 'filterController/components/drop-down-selector';
import { RootState } from 'redux/rootReducer';
import { getSettings } from 'redux/ducks/settings';

type StateProps = ReturnType<typeof mapStateToProps>;

export interface OwnProps {
  onChange: (accountIds: string[]) => void;
  requireAccountSettings?: boolean;
  value: string[];
  multiple?: boolean;
}

type AccountSelectorProps = StateProps & InjectedIntlProps & OwnProps;

export class AccountSelector extends React.Component<AccountSelectorProps> {
  static defaultProps = {
    requireAccountSettings: true,
    multiple: true
  };

  render() {
    const { onChange, accounts, value, requireAccountSettings, multiple } = this.props;

    return (
      <div className='accountSelector customer-select-and-clear'>
        <DropDownSelector
          onChangeCallback={(value) => {
            onChange(value.indexOf(null) > -1 ? [] : value);
          }}
          defaultItems={true}
          requireAccountSettings={requireAccountSettings}
          selectedCustomerIds={value.map((v) => parseInt(v))}
          multiple={multiple}
          allValues={accounts}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  accounts: getSettings(state).accounts
});

export default connect<StateProps, unknown, OwnProps>(mapStateToProps)(injectIntl(AccountSelector));
