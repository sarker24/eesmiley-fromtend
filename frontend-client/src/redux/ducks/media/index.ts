import { AxiosResponse, AxiosError } from 'axios';
import { DataTransfer } from 'frontend-core';
import { EventTypes } from 'redux-segment';
import { MediaActionTypes, MediaActions, Media, MediaState } from './types';
import { InjectedIntl } from 'react-intl';
import { ApiError } from 'redux/ducks/error/types';
import { ThunkResult } from 'redux/types';
export * from './types';

const transfer = new DataTransfer();

export const initialState: MediaState = {
  list: [],
  loading: true,
  recentlyCreated: null,
  soundList: []
};

const orderingItems = (items: Media[]) => {
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export default function reducer(
  state: MediaState = initialState,
  action: MediaActions
): MediaState {
  switch (action.type) {
    case MediaActionTypes.CREATE_REQUEST:
    case MediaActionTypes.FIND_REQUEST: {
      return { ...state, loading: true };
    }
    case MediaActionTypes.FIND_SUCCESS: {
      return {
        ...state,
        list: orderingItems(action.payload),
        loading: false
      };
    }

    case MediaActionTypes.CREATE_FAILURE:
    case MediaActionTypes.FIND_FAILURE: {
      return { ...state, loading: false };
    }
    case MediaActionTypes.CREATE_SUCCESS: {
      return {
        ...state,
        list: [action.payload, ...state.list],
        loading: false,
        recentlyCreated: action.payload
      };
    }

    case MediaActionTypes.FETCH_NOTIFICATION_SOUNDS_SUCCESS: {
      return { ...state, soundList: action.payload };
    }
    default: {
      return state;
    }
  }
}

export function create(data: Blob | File): ThunkResult<Promise<MediaActions>, MediaActions> {
  return async (dispatch) => {
    dispatch({
      type: MediaActionTypes.CREATE_REQUEST,
      payload: data
    });

    return await new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.addEventListener(
        'load',
        (e: ProgressEvent<FileReader>) => {
          const base64Img = e.target.result;

          const formData = new FormData();
          formData.append('uri', base64Img as string);
          formData.append('service', 'service-foodwaste');

          const config = {
            headers: {
              'content-type': 'multipart/form-data'
            }
          };

          transfer
            .post('/media/uploads', formData, config)
            .then((res: AxiosResponse<Media>) => {
              return resolve(
                dispatch({
                  type: MediaActionTypes.CREATE_SUCCESS,
                  payload: res.data
                })
              );
            })
            .catch((err: unknown) => {
              return resolve(
                dispatch({
                  type: MediaActionTypes.CREATE_FAILURE,
                  payload: err as AxiosError<ApiError>,
                  meta: {
                    analytics: {
                      // eslint-disable-next-line
                      eventType: EventTypes.track
                    }
                  }
                })
              );
            });
        },
        false
      );

      fileReader.readAsDataURL(data);
    });
  };
}

export function find(): ThunkResult<Promise<MediaActions>, MediaActions> {
  return async (dispatch) => {
    dispatch({
      type: MediaActionTypes.FIND_REQUEST
    });
    try {
      const response = (await transfer.get('/media/uploads')) as AxiosResponse<Media[]>;

      return dispatch({
        type: MediaActionTypes.FIND_SUCCESS,
        payload: response.data
      });
    } catch (err: unknown) {
      return dispatch({
        type: MediaActionTypes.FIND_FAILURE,
        payload: err as AxiosError<ApiError>,
        meta: {
          analytics: {
            // eslint-disable-next-line
            eventType: EventTypes.track
          }
        }
      });
    }
  };
}

/**
 * Handle the localization of certain sounds. If any of the media objects retrieved has a property "name"
 * where the value contains a underscore as the third character from the end of the string, we expect the last two characters in the string to be a locale code, e.g. da or en.
 * We also check if the name property matches any translation key if prefixed with "sounds.", and if they do, we replace the name with the respective translated value.
 * @param mediaList
 * @param intl
 * @returns {Array}
 */
export function parseNotificationSounds(mediaList: Media[], intl: InjectedIntl): Media[] {
  const parsedMediaList: Media[] = [];

  mediaList.map((upload: Media) => {
    if (
      upload.hasOwnProperty('name') &&
      typeof upload.name === 'string' &&
      upload.name.substr(-3, 1) == '_'
    ) {
      if (upload.name.toLowerCase().substr(-2, 2) != intl.locale) {
        return;
      } else if (upload.name.length > 3) {
        upload.name = upload.name.substr(0, upload.name.length - 3);
        upload.id = upload.name;
      }
    }

    if (intl.messages.hasOwnProperty('sounds.' + upload.name)) {
      upload.name = intl.messages['sounds.' + upload.name];
    }

    parsedMediaList.push(upload);
  });

  return parsedMediaList;
}

/**
 *
 * @param intl
 * @returns {(dispatch:any)=>Promise<TResult|T>}
 */
export function fetchNotificationSounds(
  intl: InjectedIntl
): ThunkResult<Promise<MediaActions>, MediaActions> {
  return async (dispatch) => {
    try {
      const response = (await transfer.get(
        '/media/uploads?service=foodwaste-sounds&public=1',
        {},
        true
      )) as AxiosResponse<Media[]>;

      const data = parseNotificationSounds(response.data, intl);

      return dispatch({
        type: MediaActionTypes.FETCH_NOTIFICATION_SOUNDS_SUCCESS,
        payload: data
      });
    } catch (err: unknown) {
      dispatch({
        type: MediaActionTypes.FETCH_NOTIFICATION_SOUNDS_FAILURE,
        payload: err as AxiosError<ApiError>,
        meta: {
          analytics: {
            // eslint-disable-next-line
            eventType: EventTypes.track
          }
        }
      });
    }
  };
}
