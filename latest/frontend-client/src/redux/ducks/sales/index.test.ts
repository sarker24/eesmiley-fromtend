import reducer, { initialState, SalesActionTypes, getSales, submitSales } from './index';
import { MockStore, DataTransferMock } from 'test-utils';

describe('sales reducer', () => {
  test('SUBMIT_SALES', () => {
    const sale = {
      id: '1',
      customerId: '1',
      userId: '1',
      date: '2020-01-01',
      guests: 123,
      income: 123,
      portionPrice: 123,
      portions: 123,
      productionCost: 123,
      productionWeight: 123
    };

    const result = reducer(initialState, {
      type: SalesActionTypes.SUBMIT_SALES,
      payload: sale
    });

    const expectedState = Object.assign({}, initialState, {
      lastSale: sale,
      sales: [sale]
    });

    expect(result).toEqual(expectedState);
  });
});

describe('sales action-creators', () => {
  let store = MockStore();
  const mockTransfer = DataTransferMock(window.sysvars.API_URL);

  beforeEach(() => {
    store = MockStore();
    mockTransfer.reset();
  });

  test('getSales', async () => {
    mockTransfer.onGet('/foodwaste/sales').replyOnce([200, 'success-response']);

    await store.dispatch(getSales());

    const expectedActions = [
      {
        payload: 'success-response',
        type: SalesActionTypes.GET_SALES
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('submitSales', async () => {
    mockTransfer
      .onDelete('/foodwaste/sales', {
        query: (params) => params.get('date') === '2018-07-01'
      })
      .replyOnce([200, 'success-response']);
    mockTransfer.onPost('/foodwaste/sales').replyOnce([200, 'success-response']);

    await store.dispatch(
      submitSales({
        income: 0,
        portions: 0,
        productionCost: 0,
        productionWeight: 0,
        portionPrice: 0,
        guests: 0,
        date: '2018-07-01'
      })
    );

    const expectedActions = [
      {
        payload: 'success-response',
        type: SalesActionTypes.SUBMIT_SALES
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
