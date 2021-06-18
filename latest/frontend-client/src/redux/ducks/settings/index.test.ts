import reducer, {
  SettingsActions,
  SettingsActionTypes,
  initialState,
  fetch,
  fetchAndUpdate,
  update,
  SavedSettings
} from './index';
import { ErrorActionTypes } from 'redux/ducks/error';
import { MockStore, DataTransferMock } from 'test-utils';

describe('[REDUX] Settings', () => {
  describe('Reducer', () => {
    test(SettingsActionTypes.FETCH, () => {
      const action: SettingsActions = {
        type: SettingsActionTypes.FETCH,
        payload: {
          ...initialState,
          currency: 'SEK'
        }
      };

      const settings = reducer(initialState, action);

      expect(settings).toEqual(
        Object.assign({}, initialState, action.payload, {
          isInitial: false,
          firstTimeNoSettings: false
        })
      );
    });

    test(SettingsActionTypes.UPDATE_EXTRA, () => {
      const action: SettingsActions = {
        type: SettingsActionTypes.UPDATE_EXTRA,
        payload: {
          currentFilter: 'areas'
        }
      };

      const settings = reducer(initialState, action);

      expect(settings).toEqual(
        Object.assign({}, initialState, { isInitial: false }, action.payload)
      );
    });

    test(SettingsActionTypes.UPDATE_SAVED, () => {
      const action: SettingsActions = {
        type: SettingsActionTypes.UPDATE_SAVED,
        payload: {
          ...initialState,
          lastUpload: 12345678,
          currency: 'EUR'
        }
      };

      const settings = reducer(initialState, action);

      expect(settings).toEqual(
        Object.assign({}, initialState, action.payload, {
          isInitial: false,
          firstTimeNoSettings: false
        })
      );
    });
  });

  describe('Action creators', () => {
    const settings = {
      ...initialState,
      currency: 'EUR',
      unit: 'lt' as const,
      database: 'eSmiley'
    };
    const mockTransfer = DataTransferMock(window.sysvars.API_URL);
    let store = MockStore();

    beforeEach(() => {
      store = MockStore({ settings });
      mockTransfer.reset();
    });

    test('fetch > success', async () => {
      mockTransfer.onGet('/foodwaste/settings').replyOnce([201, settings]);

      await store.dispatch(fetch());

      const expectedActions = [
        {
          payload: settings,
          type: SettingsActionTypes.FETCH
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    test('fetch > failed', async () => {
      mockTransfer
        .onGet('/foodwaste/settings')
        .replyOnce([400, { message: 'errors', errorCode: 'E111' }]);
      await store.dispatch(fetch());

      const expectedActions = [
        {
          payload: {
            code: 'E111',
            message: 'errors'
          },
          type: ErrorActionTypes.SHOW_ERROR
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    test('update > success', async () => {
      const currentSettings = {
        currency: 'NOK'
      };
      mockTransfer.onPost('/foodwaste/settings').replyOnce([
        201,
        {
          ...settings,
          currency: currentSettings.currency
        }
      ]);

      await store.dispatch(update(currentSettings));

      const expectedActions = [
        {
          payload: { ...settings, currency: currentSettings.currency },
          type: SettingsActionTypes.UPDATE_SAVED
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    test('update > failed', async () => {
      const currentSettings = {
        currency: 'SEK'
      };
      const error = {
        message: 'By the power of Grayskull...I have the power!',
        errorCode: 'E111'
      };
      mockTransfer.onPost('/foodwaste/settings').replyOnce([400, error]);

      await store.dispatch(update(currentSettings));

      const expectedActions = [
        {
          payload: {
            message: error.message,
            code: error.errorCode
          },
          type: ErrorActionTypes.SHOW_ERROR
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    test('fetchAndUpdate > success', async () => {
      const {
        currentFilter,
        isInitial,
        legacy,
        unitList,
        bootstrapData,
        firstTimeNoSettings,
        languageBootstrapData,
        ...savedSettings
      } = settings;
      mockTransfer.onGet('/foodwaste/settings').replyOnce([200, savedSettings]);
      mockTransfer
        .onPost('/foodwaste/settings')
        // eslint-disable-next-line
        .replyOnce((_, body) => [201, JSON.parse(body).settings]);

      const update = {
        currency: 'DKK'
      };

      const transformer: (s: SavedSettings) => Partial<SavedSettings> = (settingsUpdate) => ({
        ...settingsUpdate,
        unit: 'kg'
      });

      await store.dispatch(fetchAndUpdate(update, transformer));

      const expectedActions = [
        {
          payload: {
            ...savedSettings,
            currency: 'DKK',
            unit: 'kg'
          },
          type: SettingsActionTypes.UPDATE_SAVED
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
