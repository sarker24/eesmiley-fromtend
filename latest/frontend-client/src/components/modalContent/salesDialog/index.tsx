import * as React from 'react';
import moment from 'moment';
import { Moment } from 'moment';
import { Grid, Button, InputAdornment } from '@material-ui/core';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import SimpleDatePicker from 'components/dateSimplePicker';
import HelpText from 'components/helpText';
import { DataValidation } from 'frontend-core';
import Container from 'components/container';
import { connect } from 'react-redux';
import * as registrationsDispatch from 'redux/ducks/registrations';
import * as salesDispatch from 'redux/ducks/sales';
import * as uiDispatch from 'redux/ducks/ui';
import * as notificationDispatch from 'redux/ducks/notification';
import { formatMass, unformatMass } from 'components/formatted-mass';
import {
  formatMoney,
  formatWeight,
  getSettings as getAccountingSettings
} from 'utils/number-format';
import SalesHistory from './salesHistory';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { IReportSale } from 'src/utils/interfaces';
import { onSubmitForm } from 'utils/helpers';
import { API_DATE_FORMAT } from 'utils/datetime';
import NumberInput from 'input/number';
import { NumberFormatValues } from 'react-number-format';
import { RootState } from 'redux/rootReducer';
import classNames from 'classnames';
import { Sale, SalesActions } from 'redux/ducks/sales';
import { getRegistrationsByDate, RegistrationsActions } from 'redux/ducks/registrations';
import { Registration } from 'redux/ducks/data/registrations';
import { sum } from 'utils/array';
import _find from 'lodash/find';
import _pickBy from 'lodash/pickBy';
import { Ajv } from 'ajv';
import { ThunkDispatch } from 'redux-thunk';
import { NotificationActions } from 'redux/ducks/notification';
import { UiActions } from 'redux/ducks/ui';
import './index.scss';

const validation = new DataValidation();

interface StateProps {
  sales: Sale[];
  registrationsByDate: { [date: string]: Registration[] };
  enableGuestRegistrationFlow: boolean;
  currency: string;
}

interface DispatchProps {
  getSalesAndRegistrations: (date: Moment) => void;
  showNotification: (message: React.ReactNode, isError?: boolean) => void;
  submitSales: (data: any) => Promise<void>;
  closeModal: () => void;
}

export interface OwnProps {
  currency: string;
  massUnit: string;
}

interface DraftSale extends Omit<Partial<Sale>, 'date'> {
  date?: Moment;
}

export interface SalesDialogState {
  selectedSale: DraftSale;
  error: boolean;
  btnValue: string;
  loaded: boolean;
  showDataFields: boolean;
  showSalesHistory: boolean;
}

type SalesDialogProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

export class SalesDialog extends React.Component<SalesDialogProps, SalesDialogState> {
  timeout: any = null;
  sales: IReportSale[] = [];

  constructor(props: SalesDialogProps) {
    super(props);

    this.state = {
      selectedSale: {
        date: moment(),
        income: undefined,
        portionPrice: undefined,
        guests: undefined,
        productionCost: undefined,
        productionWeight: undefined,
        portions: undefined
      },
      error: false,
      showSalesHistory: false,
      loaded: false,
      btnValue: props.intl.messages['base.save'],
      showDataFields: false
    };
  }

  componentDidMount() {
    // fetch sales from a year's period so we can visualize them in the calendar
    // old hack used to fetch fixed amount of sales,
    // breaks if user navigates beyond one year.
    const startOfMonth: Moment = moment().startOf('month');
    const yearFromNow: Moment = startOfMonth.subtract(12, 'month');
    this.props.getSalesAndRegistrations(yearFromNow);

    const sale = this.getCurrentDaySale(moment());
    if (sale) {
      this.editSale(sale);
    }
    this.setState({ loaded: true });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  editSale = (sale: DraftSale): void => {
    const salesObject = {
      customerId: sale.customerId,
      income: formatMoney(sale.income).value,
      portionPrice: formatMoney(sale.portionPrice).value,
      productionCost: formatMoney(sale.productionCost).value,
      productionWeight: formatMass(sale.productionWeight),
      date: sale.date,
      guests: sale.guests,
      portions: sale.portions
    };

    this.setState({
      selectedSale: salesObject
    });
  };

  generateSalesObject = (): Partial<Sale> => {
    if (!this.state.selectedSale) {
      return null;
    }

    const { enableGuestRegistrationFlow } = this.props;
    const {
      date,
      portions,
      income,
      portionPrice,
      guests,
      productionCost,
      productionWeight
    } = this.state.selectedSale;

    const salesObject = {
      date: moment(date).format('YYYY-MM-DD'),
      portions,
      income: formatMoney(income, { inMajorUnit: true }).inMinorUnits,
      portionPrice: formatMoney(portionPrice, { inMajorUnit: true }).inMinorUnits,
      guests,
      productionCost: formatMoney(productionCost, { inMajorUnit: true }).inMinorUnits,
      productionWeight: unformatMass(productionWeight)
    };

    if (enableGuestRegistrationFlow) {
      delete salesObject.guests;
    }

    return _pickBy(salesObject, (val) => {
      return !!val;
    });
  };

  toSale = (draft: DraftSale): Partial<Sale> => {
    return {
      ...draft,
      date: draft.date ? draft.date.format(API_DATE_FORMAT) : null
    };
  };

  getCurrentDaySale = (date: Moment): DraftSale => {
    const { sales } = this.props;
    const currentDate = moment(date).format(API_DATE_FORMAT);
    const sale = sales.find((sale) => moment(sale.date).format(API_DATE_FORMAT) === currentDate);
    if (sale) {
      return { ...sale, date };
    }
    return {
      date,
      portions: undefined,
      income: undefined,
      portionPrice: undefined,
      guests: undefined,
      productionCost: undefined,
      productionWeight: undefined
    };
  };

  handleCreateSale = async () => {
    const { intl, showNotification, submitSales } = this.props;
    const salesObject = this.generateSalesObject();
    const valid = validation.validate('sale-post-request', salesObject) as boolean;

    if (!valid) {
      this.timeout = setTimeout(() => {
        this.setState(
          Object.assign({}, this.state, {
            error: false,
            btnValue: intl.messages['base.save']
          })
        );
      }, 5000);
      const validationErrors = (validation.library as Ajv).errors;
      const validationFields = validationErrors[validationErrors.length - 1].dataPath.split('.');
      const fieldLabel = validationFields[validationFields.length - 1];
      const field = intl.messages[`sales.dialog.${fieldLabel}`]
        ? intl.messages[`sales.dialog.${fieldLabel}`]
        : fieldLabel;
      showNotification(<FormattedMessage id={'base.validationError'} values={{ field }} />, true);

      this.setState({
        error: true,
        btnValue: intl.messages['sales.dialog.error']
      });

      return;
    }

    await submitSales(salesObject).then(() => {
      this.setState({ error: false });
    });

    showNotification(
      `${intl.messages['sales.notification.created']}${intl.messages['colon']} ${moment(
        salesObject.date
      ).format('L')} ${intl.messages['sales.notification.of']} ${formatMoney(
        salesObject.income
      ).toString()}`
    );
  };

  handleSaleChange = (name: string, value: NumberFormatValues) => {
    this.setState((prevState) => ({
      selectedSale: { ...prevState.selectedSale, [name]: value.floatValue }
    }));
  };

  handleHistoryToggle = () => {
    this.setState((prevState) => ({
      showSalesHistory: !prevState.showSalesHistory
    }));
  };

  handleHistorySaleChange = (sale: Sale) => {
    this.editSale({ ...sale, date: moment(sale.date) });
    // TODO: Remake to access element without selecting by class (class could be changed and this will stop working).
    // Currently a big amount of time was spent to do it properly, but way how to recieve dom ref to modalBody was not found.
    document.querySelector('.modal-container').scroll({
      top: 0,
      behavior: 'smooth'
    });
  };

  render() {
    const salesDialogClass = classNames('salesDialog');

    const {
      intl,
      currency,
      massUnit,
      sales,
      registrationsByDate,
      enableGuestRegistrationFlow
    } = this.props;
    const { error, btnValue, loaded, selectedSale, showSalesHistory } = this.state;
    const registrations = registrationsByDate[selectedSale.date.format(API_DATE_FORMAT)];
    const totalWeight = registrations ? sum(registrations.map((r) => r.amount)) : undefined;
    const formattedWeight = totalWeight > 0 ? formatWeight(totalWeight) : '--';
    const {
      date,
      income,
      portionPrice,
      guests,
      productionCost,
      productionWeight,
      portions
    } = selectedSale;
    const btnDisabled = !date || error;
    const today = moment().endOf('day');
    const dateIsFuture = date && date.isAfter(today, 'day');
    const accountingSettings = getAccountingSettings();

    return (
      <div className={salesDialogClass}>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={onSubmitForm(this.handleCreateSale)}>
          <div className='salesColumns'>
            <Grid container spacing={4} justify='space-between'>
              <Grid item xs={12} sm={6} md={5}>
                {!dateIsFuture && loaded && (
                  <div key={date.toString()} className='salesData'>
                    <HelpText
                      visible={income === null || income >= 0}
                      helpText={intl.messages['help.sales.income']}
                    >
                      <NumberInput
                        allowNegative={false}
                        fixedDecimalScale={true}
                        decimalScale={accountingSettings.currency.subUnitPrecision}
                        fullWidth
                        required={false}
                        autoFocus={true}
                        label={intl.messages['sales.dialog.income']}
                        name={'income'}
                        min={0}
                        value={selectedSale.income}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              {accountingSettings.currency.symbol}
                            </InputAdornment>
                          )
                        }}
                        onValueChange={(values) => this.handleSaleChange('income', values)}
                      />
                    </HelpText>
                    <HelpText
                      visible={portionPrice >= 0 || !portionPrice}
                      helpText={intl.messages['help.sales.salesPrice']}
                    >
                      <NumberInput
                        allowNegative={false}
                        fixedDecimalScale={true}
                        decimalScale={accountingSettings.currency.subUnitPrecision}
                        fullWidth
                        required={false}
                        label={intl.messages['sales.dialog.portionPrice']}
                        name={'portionPrice'}
                        min={0}
                        value={selectedSale.portionPrice}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              {accountingSettings.currency.symbol}
                            </InputAdornment>
                          )
                        }}
                        onValueChange={(values) => this.handleSaleChange('portionPrice', values)}
                      />
                    </HelpText>
                    <HelpText
                      visible={enableGuestRegistrationFlow || guests >= 0 || !guests}
                      helpText={
                        enableGuestRegistrationFlow
                          ? intl.messages['help.sales.enabledGuestRegistrations']
                          : intl.messages['help.sales.guests']
                      }
                    >
                      <NumberInput
                        allowNegative={false}
                        fullWidth
                        required={false}
                        label={intl.messages['sales.dialog.guests']}
                        name={'guests'}
                        decimalScale={0}
                        value={selectedSale.guests}
                        onValueChange={(values) => this.handleSaleChange('guests', values)}
                        className={classNames('guestInput', {
                          disabled: enableGuestRegistrationFlow
                        })}
                        disabled={enableGuestRegistrationFlow}
                      />
                    </HelpText>
                    <HelpText
                      visible={productionCost >= 0 || !productionCost}
                      helpText={intl.messages['help.sales.productionCost']}
                    >
                      <NumberInput
                        allowNegative={false}
                        fixedDecimalScale={true}
                        fullWidth
                        decimalScale={accountingSettings.currency.subUnitPrecision}
                        required={false}
                        label={intl.messages['sales.dialog.productionCost']}
                        name={'productionCost'}
                        min={0}
                        value={selectedSale.productionCost}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              {accountingSettings.currency.symbol}
                            </InputAdornment>
                          )
                        }}
                        onValueChange={(values) => this.handleSaleChange('productionCost', values)}
                      />
                    </HelpText>
                    <HelpText
                      visible={productionWeight >= 0 || !productionWeight}
                      helpText={intl.messages['help.sales.totalAmount']}
                    >
                      <NumberInput
                        allowNegative={false}
                        fixedDecimalScale={true}
                        fullWidth
                        required={false}
                        label={intl.messages['sales.dialog.productionWeight']}
                        name={'productionWeight'}
                        min={0}
                        value={selectedSale.productionWeight}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              {accountingSettings.massUnit}
                            </InputAdornment>
                          )
                        }}
                        onValueChange={(values) =>
                          this.handleSaleChange('productionWeight', values)
                        }
                      />
                    </HelpText>
                    <HelpText
                      helpText={intl.messages['help.sales.producedPortions']}
                      visible={portions >= 0 || !portions}
                    >
                      <NumberInput
                        allowNegative={false}
                        fixedDecimalScale={true}
                        decimalScale={0}
                        fullWidth
                        required={false}
                        label={intl.messages['sales.dialog.portions']}
                        name={'portions'}
                        min={0}
                        value={selectedSale.portions}
                        onValueChange={(values) => this.handleSaleChange('portions', values)}
                      />
                    </HelpText>
                  </div>
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={5}>
                <div className='wasteData'>
                  <SimpleDatePicker
                    currentDate={moment(date)}
                    range={false}
                    changeMonthHandler={(newMonth: any) => {
                      this.editSale(this.getCurrentDaySale(moment(newMonth)));
                    }}
                    changeDayHandler={(day: any) => {
                      this.editSale(this.getCurrentDaySale(moment(day)));
                    }}
                    dayClassObjectFunction={(dayReceived: Moment) => {
                      const selectedDay = moment(dayReceived).startOf('day');
                      const selectedDate = moment(date).startOf('day');
                      const sale = _find(this.props.sales, (saleObj) => {
                        return (
                          moment(saleObj.date).format('DD-MM-YYYY') ===
                          moment(dayReceived).format('DD-MM-YYYY')
                        );
                      });
                      return {
                        selectedDate: moment(selectedDay).diff(selectedDate) === 0,
                        sale: Boolean(sale),
                        'no-sale': !sale,
                        passed: selectedDay.isBefore(today)
                      };
                    }}
                  />
                  <div className='registerSection'>
                    <section className='leftSection'>
                      <p>{moment(date).format('ddd, MMM DD')}</p>
                      <p>{intl.messages['food_waste']}</p>
                    </section>
                    <section className='rightSection'>
                      <p>{formattedWeight}</p>
                    </section>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
          <div className='salesDialogFooter'>
            <Button
              className='historyButton'
              variant='contained'
              onMouseDown={this.handleHistoryToggle}
              endIcon={showSalesHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showSalesHistory
                ? intl.messages['sales.dialog.hide_history']
                : intl.messages['sales.dialog.show_history']}
            </Button>
            <Button onClick={this.props.closeModal}>{intl.messages['base.cancel']}</Button>
            <Button
              variant='contained'
              color='primary'
              disabled={dateIsFuture || btnDisabled}
              type='button'
              onClick={this.handleCreateSale}
            >
              {btnValue}
            </Button>
          </div>
        </form>
        <Container className={showSalesHistory ? 'salesHistory' : 'salesHistory hidden'}>
          <SalesHistory
            sales={sales}
            massUnit={massUnit}
            currency={currency}
            selectedSale={this.toSale(selectedSale)}
            registrationsByDate={registrationsByDate}
            historyItemOnClick={this.handleHistorySaleChange}
          />
        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  sales: state.sales.sales,
  // to do selector registration by date
  registrationsByDate: getRegistrationsByDate(state),
  enableGuestRegistrationFlow: state.settings.enableGuestRegistrationFlow,
  currency: state.settings.currency
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<
    unknown,
    unknown,
    RegistrationsActions | NotificationActions | UiActions | SalesActions
  >
) => ({
  getSalesAndRegistrations: async (date: Moment) => {
    await Promise.all([
      dispatch(registrationsDispatch.getRegistrations(date, moment())),
      dispatch(salesDispatch.getSales({ start: date }))
    ]);
  },
  showNotification: (message: string, isError: boolean) =>
    dispatch(notificationDispatch.showNotification(message, isError)),
  submitSales: (data: any) => dispatch(salesDispatch.submitSales(data)),
  closeModal: () => dispatch(uiDispatch.hideModal())
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SalesDialog));
