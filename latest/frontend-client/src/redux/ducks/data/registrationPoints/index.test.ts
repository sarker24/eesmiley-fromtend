import { createMap } from 'utils/helpers';
import { MockStore, DataTransferMock } from 'test-utils';
import {
  DataRegistrationPointsActionTypes,
  findTree,
  getRegistrationPoints,
  RegistrationPoint
} from './index';

const registrationPoints: RegistrationPoint[] = [
  {
    id: '32',
    parentId: null,
    path: null,
    name: 'Buffet',
    amount: 100,
    costPerkg: 200,
    co2Perkg: null,
    active: true,
    label: 'area'
  },
  {
    id: '52',
    parentId: '32',
    path: '32',
    name: 'Starch',
    amount: 100,
    costPerkg: 200,
    co2Perkg: null,
    active: true,
    label: 'area'
  },
  {
    id: '53',
    parentId: '32',
    path: '32',
    name: 'Fruits',
    amount: 100,
    costPerkg: 200,
    co2Perkg: null,
    active: true,
    label: 'area'
  }
];

const roots = registrationPoints.filter((registrationPoint) => registrationPoint.parentId == null);
const tree = createMap(registrationPoints);
const mockTransfer = DataTransferMock(window.sysvars.API_URL);
let store = MockStore();

describe('data/registrationPoints action-creators', () => {
  beforeEach(() => {
    store = MockStore();
    mockTransfer.reset();
  });

  test('find for single account > success', async () => {
    mockTransfer.onGet('/foodwaste/registration-points').replyOnce([200, registrationPoints]);
    mockTransfer.onGet('/foodwaste/registration-point-trees').replyOnce([200, registrationPoints]);

    await store.dispatch(getRegistrationPoints({}));

    const expectedActions = [
      { type: DataRegistrationPointsActionTypes.FIND_REQUEST },
      {
        payload: {
          allNodes: registrationPoints,
          registrationPointsMap: tree,
          roots: roots
        },
        type: DataRegistrationPointsActionTypes.FIND_SUCCESS
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('find > failure', async () => {
    mockTransfer.onGet('/foodwaste/registration-points').reply([500, 'error-response']);
    mockTransfer.onGet('/foodwaste/registration-point-trees').reply([500, 'error-response']);

    await store.dispatch(getRegistrationPoints({}));

    const expectedActions = [
      {
        type: DataRegistrationPointsActionTypes.FIND_REQUEST
      },
      {
        meta: {
          analytics: {
            eventType: 'track'
          }
        },
        type: DataRegistrationPointsActionTypes.FIND_FAILURE
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('registration-point-trees > success', async () => {
    mockTransfer.onGet('/foodwaste/registration-points').replyOnce([200, registrationPoints]);
    mockTransfer.onGet('/foodwaste/registration-point-trees').replyOnce([200, registrationPoints]);

    await store.dispatch(findTree());

    const expectedActions = [
      { type: DataRegistrationPointsActionTypes.FIND_TREE_REQUEST },
      {
        payload: {
          tree: registrationPoints,
          registrationPointsMap: tree
        },
        type: DataRegistrationPointsActionTypes.FIND_TREE_SUCCESS
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('registration-point-trees > failure', async () => {
    mockTransfer.onGet('/foodwaste/registration-points').reply([500, 'error-response']);
    mockTransfer.onGet('/foodwaste/registration-point-trees').reply([500, 'error-response']);

    await store.dispatch(findTree());

    const expectedActions = [
      {
        type: DataRegistrationPointsActionTypes.FIND_TREE_REQUEST
      },
      {
        meta: {
          analytics: {
            eventType: 'track'
          }
        },
        type: DataRegistrationPointsActionTypes.FIND_TREE_FAILURE
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
