import * as React from 'react';
import { Breadcrumbs, Typography, useTheme } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import SunIcon from 'components/icons/sun';
import { Registration } from 'redux/ducks/data/registrations';
import { formatNumber, MassUnit, transformAmount } from 'utils/number-format';
import { API_DATE_FORMAT } from 'utils/datetime';
import moment from 'moment';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { RootState } from 'redux/rootReducer';
import { connect } from 'react-redux';
import { getSettings, WasteAmountTimeSlot } from 'redux/ducks/settings';
import SuccessModal from 'registration/SuccessModal';
import { resetLastRegistration } from 'redux/ducks/registration';
import playSound from 'utils/playSound';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import Gauge from 'metrics/Gauge';

const timeoutInMs = 3000;
const defaultMaxGaugeValue = 200000; // when no target defined; old impl had 200 kg as max

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

type OwnProps = StateProps & DispatchProps & InjectedIntlProps;

const useStyles = makeStyles((theme) => ({
  value: {
    // this should match dashboard card metric value
    fontWeight: 800,
    fontSize: '26px',
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center'
  }
}));

interface CreateChartFormatterOptions {
  unit: MassUnit;
  as: MassUnit;
  precision?: number;
}

// this function starts to seem a good candidate for formatting highcharts,
// although should look into using react components (via react.portal)
function createChartFormatter(options: CreateChartFormatterOptions): (value: number) => string {
  const { unit, as, precision } = options;
  return function (value: number) {
    return formatNumber(
      Math.round(
        transformAmount(value, {
          unit,
          as
        })
      ),
      { unit: as, unitSpace: true, precision }
    );
  };
}

function createGaugeOptions(
  registration: Registration,
  target: number,
  theme: Theme,
  classes: ReturnType<typeof useStyles>
) {
  const { amount, unit } = registration;
  const formatter = createChartFormatter({ unit: unit as MassUnit, as: 'kg' });
  const {
    palette: { error, success }
  } = theme;
  const color = target && amount > target ? error.light : success.light;
  const max = target ? target * 2 : defaultMaxGaugeValue;
  // multiple to stops to avoid gradient
  const colors = target
    ? [
        { to: 0, color },
        { to: target, color },
        { to: target + 1, color },
        { to: target * 2, color }
      ]
    : [
        { to: 0, color },
        { to: max / 2, color },
        { to: max, color }
      ];
  return {
    name: 'registration-gauge',
    max,
    colors,
    hideTick: !target,
    tickFormatter: formatter,
    labelFormatter: (value: number) => `<div class="${classes.value}">${formatter(value)}</div>`
  };
}

function getTarget(expectedFoodwaste?: WasteAmountTimeSlot): number | undefined {
  if (!expectedFoodwaste) {
    return undefined;
  }

  const { period, amount } = expectedFoodwaste;

  if (period === 'day') {
    return amount;
  }

  // probably should return normalized values after all from api?

  switch (period) {
    case 'week':
      return amount / 7;
    case 'month':
      return amount / 30;
    case 'year':
      return amount / 360;
  }
}

const RegistrationSuccessModal: React.FunctionComponent<OwnProps> = (props) => {
  const timer = React.useRef<NodeJS.Timeout>();

  const theme = useTheme();
  const classes = useStyles(props);
  const { intl, expectedFoodwaste, lastRegistration, resetLastRegistration, sound } = props;
  const { pointPath, pointName, amount, date } = lastRegistration || {};
  const target = getTarget(expectedFoodwaste);

  // api returns registrations with unit kg, although the value is in g
  const [gaugeOptions, setGaugeOptions] = React.useState(
    createGaugeOptions({ ...lastRegistration, unit: 'g' }, target, theme, classes)
  );

  React.useEffect(() => {
    setGaugeOptions(createGaugeOptions({ ...lastRegistration, unit: 'g' }, target, theme, classes));
  }, [lastRegistration]);

  React.useEffect(() => {
    if (lastRegistration) {
      sound && sound.enabled && playSound(sound.url);
      timer.current = setTimeout(() => handleClose(), timeoutInMs);
      return () => clearTimeout(timer.current);
    } else {
      handleClose();
    }
  }, [lastRegistration]);

  const handleClose = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    resetLastRegistration();
  };

  return lastRegistration ? (
    <SuccessModal
      open={true}
      onClose={handleClose}
      title={intl.messages['registration.done']}
      subtitle={moment(date, API_DATE_FORMAT).format('L')}
      bodyTitle={pointName}
      badgeIcon={<SunIcon />}
      footer={
        <Breadcrumbs separator={<ChevronRightIcon />}>
          {pointPath.map((pointName) => (
            <Typography variant='subtitle2' key={pointName}>
              {pointName}
            </Typography>
          ))}
        </Breadcrumbs>
      }
    >
      <Gauge point={amount} target={target} options={gaugeOptions} />
    </SuccessModal>
  ) : null;
};

const mapStateToProps = (state: RootState) => ({
  lastRegistration: state.registration.lastRegistration,
  expectedFoodwaste: getSettings(state).currentExpectedFoodWaste,
  sound: getSettings(state).sound
});

const mapDispatchToProps = { resetLastRegistration };

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RegistrationSuccessModal));
