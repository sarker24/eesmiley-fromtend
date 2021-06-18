import reducer, {
  RegistrationActionTypes,
  RegistrationActions,
  register,
  setWeight
} from './index';
import { initialState as defaultState } from '.';

describe('registrations/[REDUX] Tests registration actions', () => {
  const mockDate = new Date('2021-01-01');
  const initialState = { ...defaultState, dateUpdatedAt: mockDate.getTime() };

  beforeAll(() => {
    // jest 26 has useFakeTimers api, but that doesnt work for some reason.
    // it would allow mocking date when passing it 'modern' arg
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('register', () => {
    register();
  });

  describe('Reducer tests', () => {
    test('SET_WEIGHT', () => {
      const payload = 1.2;
      const action: RegistrationActions = { type: RegistrationActionTypes.SET_WEIGHT, payload };

      const receivedPayload = reducer(initialState, action);

      expect(receivedPayload).toEqual({ ...initialState, weight: 1.2 });
    });

    test('SET_DATE', () => {
      const date = new Date();
      const action: RegistrationActions = { type: RegistrationActionTypes.SET_DATE, payload: date };
      const recievedPayload = reducer(initialState, action);

      expect(recievedPayload).toEqual({ ...initialState, date: date });
    });
  });

  describe('registrations/[REDUX] action creators', () => {
    test('setWeight', () => {
      const weightSet = setWeight(23.223333333);

      expect(weightSet).toEqual({
        type: RegistrationActionTypes.SET_WEIGHT,
        payload: 23.223333333
      });
    });
  });
});
