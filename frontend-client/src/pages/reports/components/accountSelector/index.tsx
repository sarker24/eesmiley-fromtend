import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import SelectField from 'material-ui/SelectField';
import FlatButton from 'material-ui/FlatButton';
import { setAccounts } from 'redux/ducks/reports';
import { getAvailableAccounts } from 'redux/ducks/reports/selectors';


interface StateProps {
  availableAccounts: { id: string; name: string, company: string }[];
  selectedAccountIds: string[];
  currentAccountId: string;
}

interface DispatchProps {
  onChange: (accountIds: any) => void;
}


export interface OwnProps {
}


type AccountSelectorProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class AccountSelector extends React.Component<AccountSelectorProps> {

  handleSelectAllAccounts = () => {
    const { onChange, availableAccounts } = this.props;
    onChange(availableAccounts.map(account => account.id));
  }

  handleSelectCurrentAccount = () => {
    const { onChange, currentAccountId } = this.props;
    onChange([currentAccountId]);
  }

  handleSelectionChange = (event, index, selectedAccounts) => {
    const { onChange } = this.props;
    onChange(selectedAccounts);
  }

  render() {
    const { intl, selectedAccountIds, availableAccounts, currentAccountId } = this.props;

    return (
      <div className='accountSelector'>
        <SelectField
          multiple={true}
          fullWidth={true}
          floatingLabelText={intl.messages['accounts']}
          value={selectedAccountIds}
          selectionRenderer={() => {
            if (selectedAccountIds.length == availableAccounts.length && availableAccounts.length > 1) {
              return intl.messages['report.filter.no_selection'];
            }

            return availableAccounts
              .filter(account => selectedAccountIds.some(id => id === account.id))
              .map(account => account.name)
              .join(',');
          }}
          onChange={this.handleSelectionChange}
        >
          <MenuItem disabled={true}>
            <FlatButton
              fullWidth={true}
              disabled={availableAccounts.length === selectedAccountIds.length}
              labelStyle={{ textTransform: 'none', fontSize: 15, fontWeight: 'normal' }}
              style={{ textAlign: 'left' }}
              onClick={this.handleSelectAllAccounts}
              label={intl.messages['selectAllAccounts']}
            />
          </MenuItem>
          <MenuItem disabled={true}>
            <FlatButton
              disabled={selectedAccountIds.length === 1 && selectedAccountIds[0] === currentAccountId}
              fullWidth={true}
              labelStyle={{ textTransform: 'none', fontSize: 15, fontWeight: 'normal' }}
              style={{ textAlign: 'left' }}
              onClick={this.handleSelectCurrentAccount}
              label={intl.messages['selectOnlyCurrentAccount']}
            />
          </MenuItem>
          <Divider/>
          {
            availableAccounts.map((account) =>
            <MenuItem
              key={account.id}
              insetChildren={true}
              checked={selectedAccountIds && selectedAccountIds.some(id => id === account.id) }
              value={account.id}
              primaryText={account.name}
            />)
          }
        </SelectField>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  availableAccounts: getAvailableAccounts(state),
  selectedAccountIds: state.reports.filter.accounts.length ? state.reports.filter.accounts : [state.user.customerId && state.user.customerId.toString()],
  currentAccountId:  state.user.customerId && state.user.customerId.toString()
});

const mapDispatchToProps = (dispatch) => ({
  onChange: (accountIds) => dispatch(setAccounts(accountIds))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AccountSelector));
