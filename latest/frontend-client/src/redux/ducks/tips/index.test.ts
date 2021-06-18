import reducer, { initialState, TipActionTypes } from './index';

describe('sales reducer', () => {
  test('FETCH_REQUEST', () => {
    const result = reducer(initialState, {
      type: TipActionTypes.FETCH_REQUEST
    });

    const expectedState = Object.assign({}, initialState, {
      initializing: true
    });

    expect(result).toEqual(expectedState);
  });

  test('FETCH_SUCCESS', () => {
    const result = reducer(initialState, {
      type: TipActionTypes.FETCH_SUCCESS,
      payload: [
        {
          title: { en: 'Heman is the master of the universe' },
          content: { en: '-' },
          imageUrl: 'http://localhost/image.png'
        }
      ]
    });

    const expectedState = Object.assign({}, initialState, {
      tips: [
        {
          content: {
            en: '-'
          },
          imageUrl: 'http://localhost/image.png',
          title: {
            en: 'Heman is the master of the universe'
          }
        }
      ],
      loaded: true,
      initial: false,
      initializing: false,
      failed: false
    });

    expect(result).toEqual(expectedState);
  });

  test('FETCH_FAILURE', () => {
    const result = reducer(initialState, {
      type: TipActionTypes.FETCH_FAILURE,
      payload: { errorCode: 200, message: 'whoops' }
    });

    const expectedState = Object.assign({}, initialState, {
      initializing: false,
      failed: true
    });

    expect(result).toEqual(expectedState);
  });
});
