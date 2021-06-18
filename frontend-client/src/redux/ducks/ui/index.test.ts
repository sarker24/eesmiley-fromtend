import reducer, {
  initialState,
  UiActions,
  UiActionTypes,
  showMenu,
  hideMenu,
  toggleMenu,
  showModal,
  hideModal
} from './index';

describe('[REDUX] Tests ui actions', () => {
  describe('Reducer tests', () => {
    test(UiActionTypes.SHOW_MENU, () => {
      const action: UiActions = { type: UiActionTypes.SHOW_MENU };

      const uiState = reducer(initialState, action);

      expect(uiState.isMenuOpen).toEqual(true);
    });

    test(UiActionTypes.HIDE_MENU, () => {
      const action: UiActions = { type: UiActionTypes.HIDE_MENU };

      const uiState = reducer(initialState, action);

      expect(uiState.isMenuOpen).toEqual(false);
    });

    test(UiActionTypes.TOGGLE_MENU, () => {
      const action: UiActions = { type: UiActionTypes.TOGGLE_MENU };

      const uiState = reducer({ ...initialState, isMenuOpen: false }, action);

      expect(uiState.isMenuOpen).toEqual(true);
    });

    test(UiActionTypes.SHOW_MODAL, () => {
      const payload = { className: undefined, content: undefined, visible: true };
      const action: UiActions = { type: UiActionTypes.SHOW_MODAL, payload };

      const uiState = reducer(initialState, action);

      expect(uiState.modal).toEqual(payload);
    });

    test(UiActionTypes.HIDE_MODAL, () => {
      const action: UiActions = { type: UiActionTypes.HIDE_MODAL };

      const uiState = reducer(initialState, action);

      expect(uiState.modal).toEqual({ ...initialState.modal, visible: false, content: null });
    });
  });

  test('showMenu', () => {
    const expectedOutput = {
      type: UiActionTypes.SHOW_MENU
    };
    expect(showMenu()).toMatchObject(expectedOutput);
  });

  test('hideMenu', () => {
    const expectedOutput = {
      type: UiActionTypes.HIDE_MENU
    };
    expect(hideMenu()).toMatchObject(expectedOutput);
  });

  test('toggleMenu', () => {
    const expectedOutput = {
      type: UiActionTypes.TOGGLE_MENU
    };
    expect(toggleMenu()).toMatchObject(expectedOutput);
  });

  test('showModal', () => {
    const content = 'Hallo World';
    const expectedOutput = {
      type: UiActionTypes.SHOW_MODAL,
      payload: { content }
    };
    expect(showModal({ content })).toMatchObject(expectedOutput);
  });

  test('hideModal', () => {
    const expectedOutput = {
      type: UiActionTypes.HIDE_MODAL
    };
    expect(hideModal()).toMatchObject(expectedOutput);
  });
});
