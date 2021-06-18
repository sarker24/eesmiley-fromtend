import { WidgetActions, WidgetActionTypes, WidgetState } from 'redux/ducks/widgets/types';

export const initialState: WidgetState = {
  editing: {}
};

export default function (state = initialState, action: WidgetActions): WidgetState {
  switch (action.type) {
    case WidgetActionTypes.WIDGETS_SET_EDIT_MODE: {
      state.editing[action.payload.id] = action.payload.editMode;
      return state;
    }
    default:
      return state;
  }
}

export const setWidgetEditMode = (id: string, editMode: boolean): WidgetActions => ({
  type: WidgetActionTypes.WIDGETS_SET_EDIT_MODE,
  payload: { id, editMode }
});
