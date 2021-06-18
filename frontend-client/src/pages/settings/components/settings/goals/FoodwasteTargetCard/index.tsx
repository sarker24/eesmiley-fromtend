import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RootState } from 'redux/rootReducer';
import {
  WasteAmount,
  getSettings,
  WasteTargetKey,
  WasteTargetKeys,
  SavedSettings,
  WasteAmountTimeSlot
} from 'redux/ducks/settings';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { update as updateSettings } from 'redux/ducks/settings';
import { Button, Card, CardActions, CardContent } from '@material-ui/core';

import moment from 'moment';
import CardHeader from 'settings/components/settings/goals/CardHeader';
import FoodwasteField from 'settings/components/settings/goals/FoodwasteField';
import SelectPeriodModal from 'settings/components/settings/goals/SelectPeriodModal';
import { isNumeric } from 'utils/math';
import { API_DATE_FORMAT } from 'utils/datetime';
import HelpText from 'helpText';

const useStyles = makeStyles({
  root: {
    height: '100%',
    display: 'flex',
    flexFlow: 'column wrap'
  },
  content: {
    flexGrow: 1
  }
});

const getDefaultTarget = (key: WasteTargetKey): WasteAmount => ({
  amount: null,
  unit: 'g',
  period: key === 'expectedFoodwaste' ? 'week' : 'fixed'
});

type SubState = {
  [K in WasteTargetKey]: WasteAmount;
};

// I couldnt figure out how to add showModal prop to SubState,
// threw type errors
type State = SubState & { showModal: boolean };

type Action =
  | { type: 'reset'; payload: State }
  | { type: 'change'; payload: { key: WasteTargetKey; value: WasteAmount } }
  | { type: 'toggleModal'; payload: boolean };

const initialState = WasteTargetKeys.reduce<State>(
  (state, key) => ({
    ...state,
    [key]: getDefaultTarget(key)
  }),
  { showModal: false } as State
);

const wasteTargetReducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case 'reset': {
      return action.payload;
    }
    case 'change': {
      const { key, value } = action.payload;
      return {
        ...state,
        [key]: value
      };
    }
    case 'toggleModal': {
      return {
        ...state,
        showModal: action.payload
      };
    }
  }
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type FoodwasteTargetCardProps = StateProps & DispatchProps & InjectedIntlProps;

const FoodwasteTargetCard: React.FunctionComponent<FoodwasteTargetCardProps> = (props) => {
  const classes = useStyles(props);
  const { updateSettings, intl } = props;
  const [draftState, dispatch] = React.useReducer(wasteTargetReducer, {
    ...WasteTargetKeys.reduce<State>(
      (state, key) => ({
        ...state,
        [key]: props[key] || getDefaultTarget(key)
      }),
      { showModal: false } as State
    )
  });

  const isActionEnabled =
    WasteTargetKeys.every(
      (key) => isNumeric(draftState[key].amount) && draftState[key].amount > 0
    ) &&
    WasteTargetKeys.some(
      (key) =>
        !props[key] ||
        props[key].amount !== draftState[key].amount ||
        props[key].period !== draftState[key].period
    );

  const handleSave = (overridePrevious: boolean) => {
    if (overridePrevious) {
      const from = moment(new Date(0)).format(API_DATE_FORMAT);
      const nextGoalSettings = WasteTargetKeys.reduce<Partial<SavedSettings>>(
        (state, key) => ({
          ...state,
          [key]: [{ ...draftState[key], from }]
        }),
        {}
      );
      updateSettings(nextGoalSettings);
    } else {
      const from = moment().format(API_DATE_FORMAT);
      const nextGoalSettings = WasteTargetKeys.reduce<Partial<SavedSettings>>(
        (state, key) => ({
          ...state,
          [key]: [
            ...(props[`${key}History`] as WasteAmountTimeSlot[]).filter(
              (slot) => slot.from !== from
            ),
            { ...draftState[key], from }
          ]
        }),
        {}
      );
      updateSettings(nextGoalSettings);
    }
    dispatch({ type: 'toggleModal', payload: false });
  };

  const handleUndo = () => {
    const stateFromProps = WasteTargetKeys.reduce<State>(
      (state, key) => ({
        ...state,
        [key]: props[key] || getDefaultTarget(key)
      }),
      { showModal: false } as State
    );

    dispatch({ type: 'reset', payload: stateFromProps });
  };

  const handleShowModal = () => {
    dispatch({ type: 'toggleModal', payload: true });
  };

  return (
    <Card className={classes.root}>
      <CardContent className={classes.content}>
        <CardHeader
          title={intl.messages['settings.personalFoodwasteTargets']}
          titleHelpIcon={
            <HelpText helpText={intl.messages['settings.personalFoodwasteTargets.description']} />
          }
        />
        <FoodwasteField
          name='total'
          label={intl.messages['base.total']}
          value={draftState.expectedFoodwaste}
          as={'kg'}
          onChange={(value) =>
            dispatch({ type: 'change', payload: { key: 'expectedFoodwaste', value } })
          }
        />
        <FoodwasteField
          name='perGuest'
          label={intl.messages['base.perGuest']}
          value={draftState.expectedFoodwastePerGuest}
          onChange={(value) =>
            dispatch({ type: 'change', payload: { key: 'expectedFoodwastePerGuest', value } })
          }
        />
        <FoodwasteField
          name='perGuestBaseline'
          label={intl.messages['base.perGuestBaseline']}
          value={draftState.perGuestBaseline}
          onChange={(value) =>
            dispatch({ type: 'change', payload: { key: 'perGuestBaseline', value } })
          }
        />
        <FoodwasteField
          name='perGuestStandard'
          label={intl.messages['base.perGuestStandard']}
          value={draftState.perGuestStandard}
          onChange={(value) =>
            dispatch({ type: 'change', payload: { key: 'perGuestStandard', value } })
          }
        />
      </CardContent>
      <CardActions>
        <Button variant='text' onClick={handleUndo} disabled={!isActionEnabled}>
          {intl.messages['base.undo']}
        </Button>
        <Button
          color='primary'
          variant='contained'
          onClick={handleShowModal}
          disabled={!isActionEnabled}
        >
          {intl.messages['base.save']}
        </Button>
      </CardActions>
      <SelectPeriodModal
        title={intl.messages['settings.personalFoodwasteGoals']}
        open={draftState.showModal}
        onAccept={() => {
          handleSave(true);
        }}
        onDecline={() => {
          handleSave(false);
        }}
      />
    </Card>
  );
};

const mapStateToProps = (state: RootState) => ({
  expectedFoodwaste: getSettings(state).currentExpectedFoodWaste,
  expectedFoodwasteHistory: getSettings(state).expectedFoodwaste || [],
  expectedFoodwastePerGuest: getSettings(state).currentExpectedFoodWastePerGuest,
  expectedFoodwastePerGuestHistory: getSettings(state).expectedFoodwastePerGuest || [],
  perGuestBaseline: getSettings(state).currentPerGuestBaseline,
  perGuestBaselineHistory: getSettings(state).perGuestBaseline || [],
  perGuestStandard: getSettings(state).currentPerGuestStandard,
  perGuestStandardHistory: getSettings(state).perGuestStandard || []
});

const mapDispatchToProps = {
  updateSettings
};
export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FoodwasteTargetCard));
