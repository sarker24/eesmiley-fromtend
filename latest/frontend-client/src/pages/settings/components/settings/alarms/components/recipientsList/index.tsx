import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
  TextField,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import AutoComplete from '@material-ui/lab/Autocomplete';
import phoneCountryCodes, { CountryCode } from 'utils/phoneCountryCodes';
import DeleteIcon from '@material-ui/icons/Delete';
import { AlarmRecipient } from 'redux/ducks/settings';

export interface OwnProps {
  value: AlarmRecipient[];
  onChange: (recipients: AlarmRecipient[]) => void;
}

export interface IComponentState {
  recipientsSMS: IRecipient[];
  recipientsEmail: IRecipient[];
  phoneCountryCode?: CountryCode;
  originalRecipientValue?: string;
  originalRecipientName?: string;
  recipient?: Partial<IRecipient>;
  dialogTitle?: string;
  isAddingNewRecipient?: boolean;
  errors: {
    phoneNum: boolean;
    name: boolean;
    email: boolean;
  };
}

export interface IRecipient extends AlarmRecipient {
  newValue?: string;
  newName?: string;
}

type RecipientsListProps = InjectedIntlProps & OwnProps;

const emptyErrors = {
  phoneNum: false,
  name: false,
  email: false
};

class RecipientsList extends React.Component<RecipientsListProps, IComponentState> {
  phoneNumInputRef: React.RefObject<HTMLInputElement>;

  constructor(props: RecipientsListProps) {
    super(props);

    this.state = {
      recipientsSMS: [],
      recipientsEmail: [],
      phoneCountryCode: null,
      errors: emptyErrors
    };

    this.phoneNumInputRef = React.createRef();
  }

  update = (value: IRecipient[]) => {
    this.setState({
      recipientsSMS: value.filter((recipient: IRecipient) => {
        return recipient.type == 'sms';
      }),
      recipientsEmail: value.filter((recipient: IRecipient) => {
        return recipient.type == 'email';
      })
    });
  };

  componentDidMount() {
    this.update(this.props.value);
  }

  UNSAFE_componentWillReceiveProps(nextProps: RecipientsListProps) {
    this.update(nextProps.value);
  }

  editRecipient = (recipient: IRecipient, isNew?: boolean) => {
    const { intl } = this.props;
    const { type, value, name } = recipient;

    const originalRecipientValue = recipient.value;
    let phoneCountryCode: CountryCode = null;

    recipient.newValue = value;
    recipient.newName = name;

    if (type === 'sms') {
      // todo: store country code separately
      phoneCountryCode = phoneCountryCodes.find((code) => value.startsWith(code.code));
      recipient.newValue = phoneCountryCode ? value.slice(phoneCountryCode.code.length) : value;
    }

    this.setState({
      recipient,
      dialogTitle: isNew
        ? recipient.type == 'email'
          ? intl.messages['addMailRecipient']
          : intl.messages['addSMSRecipient']
        : intl.messages['recipient'] + ': ' + recipient.name,
      originalRecipientValue: originalRecipientValue,
      originalRecipientName: recipient.name,
      isAddingNewRecipient: isNew,
      phoneCountryCode: phoneCountryCode,
      errors: emptyErrors
    });
  };

  handleSubmit = (event: React.FormEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const {
      errors,
      recipient: { type, newName: name, newValue: value }
    } = this.state;

    const nextErrors = {
      name: !name || name.length === 0 || errors.name,
      email: (type === 'email' && (!value || value.length === 0)) || errors.email,
      phoneNum: (type === 'sms' && (!value || value.length === 0)) || errors.phoneNum
    };

    if (Object.keys(nextErrors).some((key) => nextErrors[key])) {
      this.setState({ errors: nextErrors });
      return;
    }

    this.saveRecipient();
  };

  saveRecipient = () => {
    const { onChange, value } = this.props;
    const {
      recipient: draft,
      originalRecipientValue: rValue,
      originalRecipientName: rName,
      isAddingNewRecipient,
      phoneCountryCode
    } = this.state;
    const recipient = {
      type: draft.type,
      name: draft.newName.trim(),
      value:
        (draft.type === 'sms' ? phoneCountryCode.value.replace('+', '') : '') +
        draft.newValue.trim()
    };

    const nextValue = isAddingNewRecipient
      ? [...value, recipient]
      : value.map((r) => (r.name === rName && r.value === rValue ? recipient : r));

    this.setState({
      recipient: null,
      isAddingNewRecipient: false,
      originalRecipientValue: recipient.value,
      originalRecipientName: recipient.name
    });

    onChange(nextValue);
  };

  deleteRecipient = (recipient: IRecipient) => {
    const { value, onChange } = this.props;
    onChange(value.filter((r) => r !== recipient));
  };

  cancelEditing = () => {
    this.setState({
      recipient: null,
      isAddingNewRecipient: false,
      phoneCountryCode: null
    });
  };

  renderRecipient = (recipient: IRecipient, index: number, type: 'sms' | 'email') => {
    const { intl } = this.props;

    return (
      <TableRow key={index} className='recipientItem'>
        <TableCell
          title={intl.messages['edit']}
          onClick={() => {
            this.editRecipient(recipient);
          }}
        >
          {recipient.name}
        </TableCell>
        <TableCell
          title={intl.messages['edit']}
          onClick={() => {
            this.editRecipient(recipient);
          }}
        >
          {type == 'sms' ? '+' + recipient.value : recipient.value}
        </TableCell>
        <TableCell
          align='right'
          className='removeButton'
          title={intl.messages['data_table.delete']}
          onClick={() => {
            this.deleteRecipient(recipient);
          }}
        >
          <DeleteIcon />
        </TableCell>
      </TableRow>
    );
  };

  renderRecipientValueInput = (recipient: IRecipient) => {
    const { intl } = this.props;
    const { phoneCountryCode, errors } = this.state;

    switch (recipient.type) {
      case 'email':
        return (
          <TextField
            label={intl.messages['emailAddress']}
            value={recipient.newValue}
            required={true}
            autoFocus={recipient.newName != ''}
            type='email'
            name='value'
            error={errors.email}
            fullWidth={true}
            onChange={(e: { target: { value: string } }) => {
              const {
                target: { value }
              } = e;
              const hasError = !value || e.target.value.length === 0;
              recipient.newValue = value;
              this.setState((prev) => ({ recipient, errors: { ...prev.errors, email: hasError } }));
            }}
          />
        );
      case 'sms':
        return (
          <div className='phoneInput'>
            <div className='phoneCountryCodeInput'>
              <AutoComplete
                fullWidth
                autoSelect
                autoComplete
                disableClearable
                style={{ minWidth: '128px' }}
                value={phoneCountryCode}
                openOnFocus={true}
                options={phoneCountryCodes}
                getOptionLabel={(option) => option.text}
                onChange={(e, value: CountryCode) => this.setState({ phoneCountryCode: value })}
                renderOption={(option) => <span>{option.text}</span>}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      placeholder: '+00*'
                    }}
                    error={!phoneCountryCode && errors.phoneNum}
                    required
                  />
                )}
              />
            </div>
            <TextField
              ref={this.phoneNumInputRef}
              label={intl.messages['phoneNumber']}
              value={recipient.newValue}
              required
              autoFocus={recipient.newName != ''}
              type='tel'
              name='value'
              error={errors.phoneNum}
              fullWidth
              onChange={(e: { target: { value: string } }) => {
                const hasError = !/^[0-9()#.\s/ext-]+$/.test(e.target.value);
                recipient.newValue = e.target.value;
                this.setState((prev) => ({
                  recipient,
                  errors: { ...prev.errors, phoneNum: hasError }
                }));
              }}
            />
          </div>
        );
    }
  };

  render() {
    const { recipientsSMS, recipientsEmail, recipient, dialogTitle, errors } = this.state;
    const { intl } = this.props;

    return (
      <div className='recipientsList'>
        <Dialog
          maxWidth='sm'
          fullWidth
          className='recipientDialog'
          open={recipient != null}
          onClose={this.cancelEditing}
        >
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent>
            {recipient && (
              <form className='recipientForm' onSubmit={this.handleSubmit}>
                <TextField
                  className='nameInput'
                  label={intl.messages['nameOfRecipient']}
                  value={recipient.newName}
                  required
                  fullWidth
                  name='name'
                  error={errors.name}
                  autoFocus={recipient.newName == ''}
                  onChange={(e: { target: { value: string } }) => {
                    const {
                      target: { value }
                    } = e;
                    const hasError = !value || value.length === 0;
                    recipient.newName = value;
                    this.setState((prev) => ({
                      recipient,
                      errors: { ...prev.errors, name: hasError }
                    }));
                  }}
                />
                {this.renderRecipientValueInput(recipient as IRecipient)}
              </form>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.cancelEditing}>{intl.messages['base.cancel']}</Button>
            <Button
              disabled={Object.keys(errors).some((key) => errors[key])}
              variant='contained'
              type='submit'
              color='primary'
              onClick={this.handleSubmit}
            >
              {intl.messages['base.save']}
            </Button>
          </DialogActions>
        </Dialog>
        <div className='list'>
          <label>
            <span>{intl.messages['email']}</span>
          </label>
          {recipientsEmail.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{intl.messages['nameOfRecipient']}</TableCell>
                  <TableCell>{intl.messages['emailAddress']}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {recipientsEmail.map((recipient: IRecipient, index: number) => {
                  return this.renderRecipient(recipient, index, 'email');
                })}
              </TableBody>
              <TableFooter />
            </Table>
          )}

          <div className='recipientBtns'>
            <Button
              variant={'contained'}
              className='btn addRecipientBtn'
              onClick={() => {
                this.editRecipient({ name: '', type: 'email', value: '' }, true);
              }}
              startIcon={<AddIcon />}
            >
              {intl.messages['addMailRecipient']}
            </Button>
          </div>
        </div>
        <div className='list'>
          <label>
            <span>{intl.messages['SMS']}</span>
          </label>
          {recipientsSMS.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{intl.messages['nameOfRecipient']}</TableCell>
                  <TableCell>{intl.messages['phoneNumber']}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {recipientsSMS.map((recipient: IRecipient, index: number) => {
                  return this.renderRecipient(recipient, index, 'sms');
                })}
              </TableBody>
            </Table>
          )}
          <div className='recipientBtns'>
            <Button
              variant='contained'
              className='btn addRecipientBtn'
              onClick={() => {
                this.editRecipient({ name: '', type: 'sms', value: '' }, true);
              }}
              startIcon={<AddIcon />}
            >
              {intl.messages['addSMSRecipient']}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(RecipientsList);
