import * as React from 'react';
import { useState } from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import RankingFilter from 'report/components/AccountSelect/components/RankingFilter';
import { AccountData, AccountQuery, AccountQueryOp } from 'redux/ducks/reports-new/selectors';
import {
  Divider,
  InputAdornment,
  TextField,
  makeStyles,
  InputLabel,
  List,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  SvgIconProps
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import PersonIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import { SavedFilterSelection } from 'redux/ducks/settings';
import SaveSelectionDialog from 'report/components/AccountSelect/components/SaveSelectionDialog';
import Select from 'report/components/Select';
import SelectItem from 'report/components/Select/components/SelectItem';
import classNames from 'classnames';
import Avatar, { AvatarProps } from '@material-ui/core/Avatar/Avatar';

export interface AccountSelectProps {
  availableAccounts: AccountData[];
  accountQuery?: AccountQuery;
  selectedAccounts: AccountData[];
  onChange: (accountIds: string[]) => void;
  savedSelections: SavedFilterSelection[];
  onSavedSelectionChange: (selections: SavedFilterSelection[]) => void;
  avatarProps?: AvatarProps;
  iconProps?: SvgIconProps;
}

const AccountSelect: React.FunctionComponent<AccountSelectProps & InjectedIntlProps> = (props) => {
  const {
    intl,
    selectedAccounts,
    availableAccounts,
    accountQuery,
    onChange,
    savedSelections,
    onSavedSelectionChange,
    avatarProps = {},
    iconProps = {}
  } = props;
  const { className: avatarClassName, ...avatarRestProps } = avatarProps;
  const { className: iconClassName, ...iconRestProps } = iconProps;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const classes = useStyles(props);

  const handleSelectAllAccounts = () => {
    onChange(availableAccounts.map((account) => account.id));
  };

  const handleSelectCurrentAccount = () => {
    const currentAccount = availableAccounts.find((account) => account.isCurrentAccount);
    if (!currentAccount) {
      return;
    }
    onChange([currentAccount.id]);
  };

  const handleSelectRanking = (ranking: string) => {
    onChange([ranking]);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const {
      target: { value }
    } = event;
    setSearchTerm(value);
  };

  const handleSaveSelection = (selectionName: string) => {
    onSavedSelectionChange([
      ...savedSelections,
      {
        name: selectionName,
        accountIds: selectedAccounts.map((account) => account.id)
      }
    ]);
  };

  const handleRemoveSelection = (selectionName) => {
    onSavedSelectionChange(savedSelections.filter((selection) => selection.name !== selectionName));
  };

  const handleSelectChange = (accountId) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    const currentSelectedIds: string[] = selectedAccounts.map((account) => account.id);
    const isSelected = !currentSelectedIds.includes(accountId);
    const nextSelectedIds = isSelected
      ? [...currentSelectedIds, accountId]
      : currentSelectedIds.filter((id) => id !== accountId);
    if (nextSelectedIds.length === 0) {
      return; // must have 1 selected
    } else {
      onChange(nextSelectedIds);
    }
  };

  const renderValue = () => {
    if (selectedAccounts.length === availableAccounts.length && availableAccounts.length > 1) {
      return intl.messages['report.filter.no_selection'];
    }

    if (accountQuery) {
      const { op, value } = accountQuery;
      return intl.formatMessage({ id: `report.filter.${op}_selection` }, { value });
    }

    return selectedAccounts.map((account) => account.name.trim()).join(', ');
  };

  // Probably better idea to use autocomplete, which is meant for complex select cases
  // We only utilize dropdown menu / select renderer of the select component

  const hasSelectedAll = selectedAccounts.length === availableAccounts.length;
  const hasSelectedCurrent =
    selectedAccounts.length === 1 &&
    Boolean(
      availableAccounts.find(
        (account) => account.id === selectedAccounts[0].id && account.isCurrentAccount
      )
    );
  return (
    <Select
      renderValue={renderValue}
      buttonProps={{
        fullWidth: true,
        startIcon: (
          <Avatar
            className={classNames(classes.avatar, { [avatarClassName]: Boolean(avatarClassName) })}
            {...avatarRestProps}
          >
            <PersonIcon
              className={classNames(classes.icon, { [iconClassName]: Boolean(iconClassName) })}
              {...iconRestProps}
            />
          </Avatar>
        )
      }}
      menuProps={{ MenuListProps: { disablePadding: true } }}
    >
      <SelectItem
        onClick={handleSelectAllAccounts}
        disabled={hasSelectedAll}
        selected={hasSelectedAll}
        checkbox
      >
        <ListItemText>{intl.messages['report.filter.selectAllDepartments']}</ListItemText>
      </SelectItem>
      <SelectItem
        onClick={handleSelectCurrentAccount}
        disabled={hasSelectedCurrent}
        selected={hasSelectedCurrent}
        checkbox
      >
        <ListItemText>{intl.messages['report.filter.selectCurrentDepartment']}</ListItemText>
      </SelectItem>
      <Divider />
      <SelectItem disableRipple>
        <RankingFilter
          type={AccountQueryOp.top}
          accountQuery={accountQuery}
          onChange={handleSelectRanking}
        />
      </SelectItem>
      <SelectItem disableRipple>
        <RankingFilter
          type={AccountQueryOp.bottom}
          accountQuery={accountQuery}
          onChange={handleSelectRanking}
        />
      </SelectItem>
      <Divider />
      {savedSelections.map((selection) => (
        <SelectItem key={selection.name}>
          <ListItemText onClick={() => onChange(selection.accountIds)}>
            {selection.name}
          </ListItemText>
          <ListItemIcon className={classes.deleteListItemIcon}>
            <DeleteIcon fontSize='small' onClick={() => handleRemoveSelection(selection.name)} />
          </ListItemIcon>
        </SelectItem>
      ))}
      <Divider />
      <List>
        <ListSubheader disableSticky>
          <InputLabel className={classes.searchHeader}>
            {intl.messages['report.filter.orSelectAccountsIndividually']}
          </InputLabel>
        </ListSubheader>
        <SelectItem disableLookup disableRipple disableHover tabIndex={'-1'}>
          <TextField
            type='search'
            className={classes.searchTextField}
            fullWidth
            placeholder={intl.messages['search']}
            value={searchTerm}
            variant='outlined'
            size='small'
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon className={classes.searchIcon} />
                </InputAdornment>
              )
            }}
          />
        </SelectItem>
        <List className={classes.scrollableList}>
          {availableAccounts
            .filter((account) => account.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((account) => (
              <SelectItem
                key={account.id}
                onClick={handleSelectChange(account.id)}
                selected={selectedAccounts.some((selected) => selected.id === account.id)}
                checkbox
              >
                <ListItemText>{account.name}</ListItemText>
              </SelectItem>
            ))}
        </List>
        <SelectItem disableLookup disableRipple disableHover>
          <SaveSelectionDialog
            onSave={handleSaveSelection}
            disabled={selectedAccounts.length === 0}
          />
        </SelectItem>
      </List>
    </Select>
  );
};

const useStyles = makeStyles((theme) => ({
  avatar: {
    height: 'initial',
    width: 'initial'
  },
  icon: {
    color: 'inherit',
    fontSize: 'inherit'
  },
  deleteListItemIcon: {
    justifyContent: 'flex-end'
  },
  scrollableList: {
    maxHeight: 300,
    overflowY: 'auto'
  },
  searchHeader: {
    fontWeight: 'bold'
  },
  searchTextField: {
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.primary.main
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.primary.light
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main
      }
    }
  },
  searchIcon: {
    color: theme.palette.primary.light
  }
}));

export default injectIntl(AccountSelect);
