import {
  ActiveStep,
  HelpContent,
  TutorialActions,
  TutorialActionTypes,
  TutorialState
} from 'redux/ducks/tutorials/types';

export const initialState: TutorialState = {
  step: undefined,
  tutorialId: undefined,
  title: undefined,
  content: undefined,
  // anchorEl to be treated as opaque token,
  // dont try to read its props
  stepAnchorEl: undefined
};

export default function (state = initialState, action: TutorialActions): TutorialState {
  switch (action.type) {
    case TutorialActionTypes.SET_STEP: {
      return { ...state, stepAnchorEl: undefined, ...action.payload };
    }

    case TutorialActionTypes.RESET_STEP: {
      return { ...initialState };
    }
    case TutorialActionTypes.SET_STEP_ANCHOR: {
      return { ...state, stepAnchorEl: action.payload };
    }
    default:
      return state;
  }
}

export const setActiveStep = (step: ActiveStep & HelpContent): TutorialActions => ({
  type: TutorialActionTypes.SET_STEP,
  payload: step
});

export const resetStep = (): TutorialActions => ({
  type: TutorialActionTypes.RESET_STEP
});

export const setStepAnchor = (archorElement: HTMLElement): TutorialActions => ({
  type: TutorialActionTypes.SET_STEP_ANCHOR,
  payload: archorElement
});
