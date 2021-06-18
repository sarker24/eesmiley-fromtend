import * as React from 'react';
import { Select, MenuItem } from '@material-ui/core';
import HelpText from 'helpText';
import { connect } from 'react-redux';
import './index.scss';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RootState } from 'redux/rootReducer';
import { Account } from 'redux/ducks/settings';

type StateProps = ReturnType<typeof mapStateToProps>;

interface OwnProps {
  multiple: boolean;
  allValues: Account[];
  limit?: number;
  onChangeCallback?: (accountIds: string[]) => void;
  defaultItems?: boolean;
  requireAccountSettings?: boolean;
  selectedCustomerIds?: number[];
}

type DropDownSelectorProps = StateProps & InjectedIntlProps & OwnProps;

const SELECT_ALL = 'SELECT_ALL';
const SELECT_CURRENT = 'SELECT_CURRENT';
const ONLY_CURRENT = 'ONLY_CURRENT';

const parseSelection = (props: OwnProps & { currentCustomerId: number }): (number | string)[] => {
  const { allValues, selectedCustomerIds, currentCustomerId } = props;
  if (selectedCustomerIds.length === 0 && currentCustomerId) {
    return [currentCustomerId];
  }
  if (allValues.length === selectedCustomerIds.length - 1) {
    return [SELECT_ALL];
  }

  return selectedCustomerIds.length > 0 ? selectedCustomerIds : [];
};

class DropDownSelector extends React.Component<DropDownSelectorProps> {
  getDefaultItems = (): React.ReactNode[] => {
    const { intl, allValues, multiple, currentCustomerId, selectedIds } = this.props;

    let elements: React.ReactNode[] = [];

    if (multiple) {
      elements = [
        <MenuItem
          key='my_customer_id'
          selected={selectedIds.includes(currentCustomerId)}
          value={currentCustomerId}
        >
          {intl.messages['report.filter.my_customer_id']}
        </MenuItem>
      ];

      if (allValues.length > 0) {
        elements.unshift(
          <MenuItem
            key='no_selection'
            disabled={selectedIds.includes(SELECT_ALL)}
            selected={selectedIds.includes(SELECT_ALL)}
            value={SELECT_ALL}
          >
            {intl.messages['selectAllAccounts']}
          </MenuItem>,
          <MenuItem
            key='only_current'
            disabled={
              selectedIds.includes(ONLY_CURRENT) ||
              (selectedIds.length === 1 && selectedIds.includes(currentCustomerId))
            }
            selected={selectedIds.includes(ONLY_CURRENT)}
            value={ONLY_CURRENT}
          >
            {intl.messages['selectOnlyCurrentAccount']}
          </MenuItem>
        );
      }
    }

    return elements;
  };

  handleSelection = (
    event: React.ChangeEvent<{ name?: string; value: unknown; selected: boolean }>
  ) => {
    if (event.target.hasOwnProperty('selected') && event.target.selected === false) {
      return;
    }

    const rawValues = event.target.value ? event.target.value : [];
    let values: (string | number)[] = this.props.multiple
      ? (rawValues as (string | number)[])
      : [rawValues as string | number];

    if (values.length > 0) {
      if (values[values.length - 1] == SELECT_ALL) {
        values = [SELECT_ALL];
      } else if (values[values.length - 1] == SELECT_CURRENT) {
        values = [SELECT_CURRENT];
      } else if (values[values.length - 1] == ONLY_CURRENT) {
        values = [this.props.currentCustomerId];
      } else {
        const indexOfSelectAll = values.indexOf(SELECT_ALL);
        if (indexOfSelectAll > -1) {
          values.splice(indexOfSelectAll, 1);
        }

        const indexOfSelectCurrent = values.indexOf(SELECT_CURRENT);

        if (indexOfSelectCurrent > -1) {
          values.splice(indexOfSelectCurrent, 1);
        }
      }
    } else {
      values = [this.props.currentCustomerId];
    }

    this.props.allValues.map((account: { id: number; settingsAreSet: boolean }) => {
      if (
        account.hasOwnProperty('settingsAreSet') &&
        account.settingsAreSet === false &&
        this.props.requireAccountSettings
      ) {
        const index = values.indexOf(account.id);
        if (index > -1) {
          values.splice(index, 1);
        }
      }
    });

    if (this.props.onChangeCallback) {
      let chosenValues = values;
      if (chosenValues.length == 1) {
        if (chosenValues[0] == SELECT_ALL) {
          chosenValues = this.props.allValues.map(
            (account: { id: number; settingsAreSet: boolean }) => {
              if (account.settingsAreSet !== false || !this.props.requireAccountSettings) {
                return account.id;
              }

              return null;
            }
          );
          if (chosenValues.indexOf(this.props.currentCustomerId) < 0) {
            chosenValues.push(this.props.currentCustomerId);
          }
          chosenValues = chosenValues.filter((id: number | null) => {
            return id !== null;
          });
        }
      }
      this.props.onChangeCallback(chosenValues as string[]);
    }
  };

  render() {
    const { intl, multiple, allValues, requireAccountSettings, selectedIds } = this.props;
    return (
      <Select
        className='customerSelector'
        multiple={multiple}
        value={selectedIds || [SELECT_CURRENT]}
        onChange={this.handleSelection}
        disabled={allValues.length == 0}
        style={{
          minWidth: 150,
          maxWidth: 250,
          textAlign: 'center'
        }}
        autoWidth={false}
        renderValue={() => {
          return this.props.intl.messages['accounts'];
        }}
      >
        {this.props.limit && (
          <label className='selectedLabel'>
            {`${intl.messages['benchmarks.dialog.selected']} ${selectedIds.length}`}/
            {this.props.limit}
            <HelpText visible={true} helpText={intl.messages['benchmarks.dialog.maximum']} />
          </label>
        )}
        {this.props.defaultItems && this.getDefaultItems()}
        {allValues.map((data) => {
          return (
            <MenuItem
              value={data.id}
              key={data.id}
              selected={selectedIds.includes(data.id)}
              disabled={data.settingsAreSet === false && requireAccountSettings}
            >
              {data.name}
            </MenuItem>
          );
        })}
      </Select>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  currentCustomerId: state.user.customerId,
  currentCustomerName: state.user.customerName,
  selectedIds: parseSelection({
    currentCustomerId: state.user.customerId,
    ...ownProps
  })
});

export default connect<StateProps, unknown, OwnProps>(mapStateToProps)(
  injectIntl(DropDownSelector)
);
