import Gauge from 'registration/Register/gauge-chart';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Grid } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import * as registrationDispatch from 'redux/ducks/registration';
import NumberInput from 'components/input/number';
import { NumberFormatValues } from 'react-number-format';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { RegistrationActions } from 'redux/ducks/registration';

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface ComponentProps extends StoreProps, DispatchProps, InjectedIntlProps {}

class WeightHandler extends React.Component<ComponentProps> {
  UNSAFE_componentWillMount() {
    window.addEventListener('message', this.onReceivePostMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onReceivePostMessage);
  }

  onValueChange = (values: NumberFormatValues) => {
    this.props.setWeight(values.floatValue);
  };

  onReceivePostMessage = (
    event: MessageEvent<{ connectionType?: string; isMessage?: boolean; weight: number }>
  ) => {
    if (!event || !event.data) return;

    const { canUseBluetooth, weight, setWeight } = this.props;
    const isMessageViaBLE =
      event.data.hasOwnProperty('connectionType') && event.data.connectionType === 'BLE';

    // For Bluetooth messages, we only allow them if the user has enabled Bluetooth in FoodWaste Settings
    if ((isMessageViaBLE && canUseBluetooth) || !isMessageViaBLE) {
      if (event.data.hasOwnProperty('isMessage') && !event.data.isMessage) {
        setTimeout(() => {
          if (event.data.weight !== weight) {
            setWeight(event.data.weight);
          }
        }, 0);
      }
    }
  };

  render() {
    const { weight, massUnit, isScaleConnected } = this.props;

    return (
      <Grid item xs={12} className='weight-container'>
        <Grid item xs={12} className='gauge-container'>
          <Gauge value={weight} />
        </Grid>

        <Grid item xs={12} className='double-pair-container'>
          {
            <NumberInput
              className='number-input'
              value={weight === 0 && !isScaleConnected ? '' : weight}
              type={'text'}
              required={true}
              suffix={` ${massUnit}`}
              onValueChange={this.onValueChange}
              allowNegative={false}
              id='weight'
              name='weight'
              autoComplete='off'
              disabled={isScaleConnected}
              autoFocus={!isScaleConnected}
            />
          }
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  isScaleConnected: state.registration.scaleStatus.isConnected,
  weight: state.registration.weight,
  massUnit: state.settings.unit,
  canUseBluetooth: state.settings.canUseBluetooth
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, RegistrationActions>) => ({
  setWeight: (weight: number) => {
    dispatch(registrationDispatch.setWeight(weight));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(WeightHandler));
