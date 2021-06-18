export enum WidgetActionTypes {
  WIDGETS_SET_EDIT_MODE = 'esmiley/ui/widgets/WIDGETS_SET_EDIT_MODE'
}

export interface WidgetState {
  editing?: {
    [id: string]: boolean;
  };
}

type SetWidgetEditModeAction = {
  type: typeof WidgetActionTypes.WIDGETS_SET_EDIT_MODE;
  payload: { id: string; editMode: boolean };
};

export type WidgetActions = SetWidgetEditModeAction;
