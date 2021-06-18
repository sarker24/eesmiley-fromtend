/*

This is sort of quick mock for data transfer, although it uses impl details (xhr).
Best case would be to directly mock the data transfer module api without having to deal with
impl details (or even move mock to core lib)

*/

const Methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const;
type Method = typeof Methods[number];

type Options = {
  url: string;
  defaultStatus: number;
  query: boolean | ((queryParams: URLSearchParams) => boolean);
  response: MockResponseOptions;
  count?: number;
  always?: boolean;
};

// todo add headers
export type ResponseOptions =
  | string
  | [number, unknown]
  | {
      status?: number;
      response: unknown;
    };

export type RequestHeaders = { [header: string]: string };
export type RequestBody = string;

export type MockResponseOptions =
  | ResponseOptions
  | ((headers: RequestHeaders, body: RequestBody) => ResponseOptions);

const mockMap = (() => {
  let mocks: { [endpoint: string]: Options[] } = {};

  const add = (key: string, data: Options): void => {
    mocks[key] = [...(mocks[key] || []), data];
  };

  const get = (key: string): Options | undefined => {
    const mocksByKey = mocks[key];

    if (!mocksByKey) {
      return;
    }

    const [head, ...rest] = mocksByKey;

    if (head.always) {
      return head;
    }

    if (head.count === 1) {
      mocks[key] = rest.length > 0 ? rest : undefined;
      return head;
    }

    mocks[key] = [{ ...head, count: head.count - 1 }, ...rest];
    return head;
  };

  const reset = (): void => {
    mocks = {};
  };

  return {
    add,
    get,
    reset
  };
})();

const XMLHttpRequestMock = () => {
  let requestKey = null;
  const requestHeaders: RequestHeaders = {};
  let queryParams: URLSearchParams = null;

  const extractResponse = (body: any, responseOptions: Options) => {
    // todo headers + body check to mockMethod call args
    const response =
      typeof responseOptions.response === 'function'
        ? responseOptions.response(requestHeaders, body)
        : responseOptions.response;

    if (Array.isArray(response)) {
      return {
        status: response[0],
        response: response[1]
      };
    }

    const status = typeof response === 'string' ? responseOptions.defaultStatus : response.status;
    const data = typeof response === 'string' ? response : response.response;

    return { status, response: data };
  };

  const requestState = {
    onreadystatechange: () => {
      /* no op */
    },
    onerror: () => {
      /* no op */
    },
    open: (method: string, rawURL: string) => {
      const queryParamIndex = rawURL.indexOf('?');
      const url = queryParamIndex >= 0 ? rawURL.slice(0, queryParamIndex) : rawURL;
      queryParams =
        queryParamIndex >= 0
          ? new URLSearchParams(rawURL.slice(queryParamIndex))
          : new URLSearchParams('');
      requestKey = method + '_' + url;
    },
    send: (requestBody: any) => {
      const options = requestKey ? mockMap.get(requestKey) : undefined;
      if (
        options &&
        (typeof options.query === 'function' ? options.query(queryParams) : options.query)
      ) {
        const mockResponse = extractResponse(requestBody, options);
        requestState.readyState = 4;
        requestState.status = mockResponse.status;

        requestState.responseURL = options.url;
        requestState.responseText = JSON.stringify(mockResponse.response);
        requestState.response = JSON.stringify(mockResponse.response);
        requestState.onreadystatechange();
      } else {
        requestState.readyState = 4;
        requestState.status = 500;
        requestState.responseText = 'not mocked';
        requestState.response = 'not mocked';
        requestState.onreadystatechange();
      }
    },
    readyState: 0,
    setRequestHeader: (key: string, value: string) => (requestHeaders[key] = value),
    status: null,
    responseURL: null,
    response: null,
    responseText: null
  };

  return requestState;
};

// eslint-disable-next-line
// @ts-ignore
window.XMLHttpRequest = jest.fn().mockImplementation(XMLHttpRequestMock);

export default (baseURL?: string) => {
  const formattedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

  const buildURL = (path: string): string => {
    if (baseURL && !path.startsWith('http')) {
      const formattedPath = path.startsWith('/') ? path : '/' + path;
      return formattedBaseURL + formattedPath;
    }
    return path;
  };

  mockMap.reset();

  // todo: MockApiOptions = { query: boolean } | ((query: URLSearchParams) => boolean)
  type MockApiOptions = {
    query: boolean | ((queryParams: URLSearchParams) => boolean); // defaults to true, accepts any query params
  };

  type MockApiMethod = (url: string, options?: MockApiOptions) => ReturnType<typeof actions>;

  // TODO: onAny(*|url)
  type MockApi = {
    onGet: MockApiMethod;
    onPost: MockApiMethod;
    onPatch: MockApiMethod;
    onDelete: MockApiMethod;
    onPut: MockApiMethod;
  };

  const actions = (
    verb: Method,
    url: string,
    requestOptions: MockApiOptions = { query: true }
  ) => ({
    reply: (options: MockResponseOptions) => {
      const fullURL = buildURL(url);
      const key = verb + '_' + fullURL;
      mockMap.add(key, {
        query: requestOptions.query,
        defaultStatus: 200,
        response: options,
        url: fullURL,
        always: true
      });
      return mock;
    },
    replyOnce: (options: MockResponseOptions) => {
      const fullURL = buildURL(url);
      const key = verb + '_' + fullURL;
      mockMap.add(key, {
        query: requestOptions.query,
        defaultStatus: 200,
        response: options,
        url: fullURL,
        count: 1
      });
      return mock;
    },
    rejectOnce: (options: MockResponseOptions) => {
      const fullURL = buildURL(url);
      const key = verb + '_' + fullURL;
      mockMap.add(key, {
        query: requestOptions.query,
        defaultStatus: 500,
        response: options,
        url: fullURL,
        count: 1
      });
      return mock;
    },
    reject: (options: MockResponseOptions) => {
      const fullURL = buildURL(url);
      const key = verb + '_' + fullURL;
      mockMap.add(key, {
        query: requestOptions.query,
        defaultStatus: 500,
        response: options,
        url: fullURL,
        always: true
      });
      return mock;
    }
  });

  const mock = {
    reset: mockMap.reset,
    ...Methods.reduce<MockApi>(
      (all, m) => ({
        ...all,
        [`on${m[0].toUpperCase() + m.slice(1).toLowerCase()}`]: (url, options) =>
          actions(m, url, options)
      }),
      {} as MockApi
    )
  };

  return mock;
};
