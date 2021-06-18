import { MockStore, DataTransferMock } from 'test-utils';
import {
  create,
  fetchNotificationSounds,
  find,
  Media,
  MediaActionTypes,
  parseNotificationSounds
} from './index';
import { InjectedIntl } from 'react-intl';

describe('media action-creators', () => {
  const store = MockStore();
  const transferMock = DataTransferMock(window.sysvars.API_URL);

  beforeEach(() => {
    store.clearActions();
    transferMock.reset();
  });

  test('find > success', async () => {
    transferMock.onGet('/media/uploads').replyOnce({
      status: 200,
      response: [
        {
          id: 1,
          name: 'File',
          url: 'url',
          fileId: 'file id',
          customerId: 1,
          userId: 1
        }
      ]
    });

    await store.dispatch(find());

    const expectedActions = [
      { type: MediaActionTypes.FIND_REQUEST },
      {
        type: MediaActionTypes.FIND_SUCCESS,
        payload: [
          {
            id: 1,
            name: 'File',
            url: 'url',
            fileId: 'file id',
            customerId: 1,
            userId: 1
          }
        ]
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('find > failure', async () => {
    transferMock.onGet('/media/uploads').rejectOnce('error-response');

    await store.dispatch(find());

    const expectedActions = [
      { type: MediaActionTypes.FIND_REQUEST },
      {
        type: MediaActionTypes.FIND_FAILURE,
        meta: {
          analytics: {
            eventType: 'track'
          }
        },
        payload: new Error('Request failed with status code 500')
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('create > success', async () => {
    transferMock.onPost('/media/uploads').replyOnce({
      response: [
        {
          id: 1,
          name: 'File',
          url: 'url',
          fileId: 'file id',
          customerId: 1,
          userId: 1
        }
      ]
    });
    const file = new File([new Blob()], 'image.png', { type: 'image/png' });

    await store.dispatch(create(file));

    const expectedActions = [
      { type: MediaActionTypes.CREATE_REQUEST, payload: file },
      {
        type: MediaActionTypes.CREATE_SUCCESS,
        payload: [
          {
            customerId: 1,
            fileId: 'file id',
            id: 1,
            name: 'File',
            url: 'url',
            userId: 1
          }
        ]
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('fetchNotificationSounds > success', async () => {
    // url /media/uploads?service=foodwaste-sounds&public=1
    transferMock.onGet('/media/uploads').replyOnce({
      response: [
        {
          id: 1,
          name: 'File',
          url: 'url',
          fileId: 'file id',
          customerId: null,
          userId: null
        }
      ]
    });
    const intl = {
      messages: {},
      locale: 'da'
    };

    await store.dispatch(fetchNotificationSounds(intl as InjectedIntl));

    const expectedActions = [
      {
        type: MediaActionTypes.FETCH_NOTIFICATION_SOUNDS_SUCCESS,
        payload: [
          {
            customerId: null,
            fileId: 'file id',
            id: 1,
            name: 'File',
            url: 'url',
            userId: null
          }
        ]
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('fetchNotificationSounds > failure', async () => {
    transferMock.onGet('/media/uploads').rejectOnce('error-response');
    const intl = {
      messages: {},
      locale: 'da'
    };

    await store.dispatch(fetchNotificationSounds(intl as InjectedIntl));

    const expectedActions = [
      {
        type: MediaActionTypes.FETCH_NOTIFICATION_SOUNDS_FAILURE,
        meta: {
          analytics: {
            eventType: 'track'
          }
        },
        payload: new Error('Request failed with status code 500')
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('parseNotificationSounds > success', () => {
    const mediaList: Media[] = [
      {
        id: '1',
        url: 'string',
        fileId: 'string',
        service: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        deletedAt: 'string',
        customerId: 'string',
        userId: 'string',
        name: 'thank_you_for_your_registration_da'
      },
      {
        id: '2',
        url: 'string',
        fileId: 'string',
        service: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        deletedAt: 'string',
        customerId: 'string',
        userId: 'string',
        name: 'Gooong'
      },
      {
        id: '3',
        url: 'string',
        fileId: 'string',
        service: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        deletedAt: 'string',
        customerId: 'string',
        userId: 'string',
        name: 'thank_you_for_your_registration_en'
      },
      {
        id: '4',
        url: 'string',
        fileId: 'string',
        service: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        deletedAt: 'string',
        customerId: 'string',
        userId: 'string',
        name: '_en'
      },
      {
        id: '5',
        url: 'string',
        fileId: 'string',
        service: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        deletedAt: 'string',
        customerId: 'string',
        userId: 'string',
        name: 'thank_you_for_your_registration_mx'
      },
      {
        id: '6',
        url: 'string',
        fileId: 'string',
        service: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        deletedAt: 'string',
        customerId: 'string',
        userId: 'string',
        name: 'hello_to_you_da'
      },
      {
        id: '7',
        url: 'string',
        fileId: 'string',
        service: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        deletedAt: 'string',
        customerId: 'string',
        userId: 'string',
        name: 'bye_to_you_da'
      }
    ];

    const intl: unknown = {
      messages: {
        'sounds.thank_you_for_your_registration': 'Tak for din registrering',
        'sounds.hello_to_you': 'Halløj'
      },
      locale: 'da'
    };

    const parsedMediaList = parseNotificationSounds(mediaList, intl as InjectedIntl);

    expect(parsedMediaList.length).toEqual(4);

    expect(parsedMediaList[0].name).toEqual('Tak for din registrering');
    expect(parsedMediaList[0].id).toEqual('thank_you_for_your_registration');

    expect(parsedMediaList[1].name).toEqual('Gooong');
    expect(parsedMediaList[1].id).toEqual('2');

    expect(parsedMediaList[2].name).toEqual('Halløj');
    expect(parsedMediaList[2].id).toEqual('hello_to_you');

    expect(parsedMediaList[3].name).toEqual('bye_to_you');
    expect(parsedMediaList[3].id).toEqual('bye_to_you');
  });

  test('parseNotificationSounds > with empty mediaList', () => {
    const intl: unknown = {
      messages: {
        'sounds.thank_you_for_your_registration': 'Tak for din registrering',
        'sounds.hello_to_you': 'Halløj'
      },
      locale: 'da'
    };

    const parsedMediaList = parseNotificationSounds([], intl as InjectedIntl);
    expect(parsedMediaList.length).toEqual(0);
  });

  test('parseNotificationSounds > with empty parsedMediaList', () => {
    const mediaList: Media[] = [
      {
        id: '7',
        url: 'string',
        fileId: 'string',
        service: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        deletedAt: 'string',
        customerId: 'string',
        userId: 'string',
        name: 'thank_you_for_your_registration_en'
      },
      {
        id: '8',
        url: 'string',
        fileId: 'string',
        service: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        deletedAt: 'string',
        customerId: 'string',
        userId: 'string',
        name: 'thank_you_for_your_registration_se'
      }
    ];

    const intl: unknown = {
      messages: {
        'sounds.thank_you_for_your_registration': 'Tak for din registrering',
        'sounds.hello_to_you': 'Halløj'
      },
      locale: 'da'
    };

    const parsedMediaList = parseNotificationSounds(mediaList, intl as InjectedIntl);
    expect(parsedMediaList.length).toEqual(0);
  });
});
