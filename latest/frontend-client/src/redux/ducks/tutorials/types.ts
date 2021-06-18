import type { ReactNode } from 'react';

export type ActiveStep = {
  tutorialId: string;
  step: number;
};

export type HelpContent = {
  title: ReactNode;
  content: ReactNode;
};

export type TutorialState = Partial<ActiveStep> &
  Partial<HelpContent> & { stepAnchorEl?: HTMLElement };

export enum TutorialActionTypes {
  SET_STEP = 'esmiley/tutorial/SET_STEP',
  RESET_STEP = 'esmiley/tutorial/RESET_STEP',
  SET_STEP_ANCHOR = 'esmiley/tutorial/SET_STEP_ANCHOR'
}

type SetStep = {
  type: typeof TutorialActionTypes.SET_STEP;
  payload: ActiveStep & HelpContent;
};

type ResetStep = {
  type: typeof TutorialActionTypes.RESET_STEP;
};

type SetAnchorEl = {
  type: typeof TutorialActionTypes.SET_STEP_ANCHOR;
  payload: HTMLElement;
};

export type TutorialActions = SetStep | ResetStep | SetAnchorEl;
