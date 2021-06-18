import Cache from './cache';

describe('[REDUX] reports v2 > cache', () => {

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('fw_reports_query_cache', JSON.stringify({}));
  });

  test('it can be constructed', () => {
    const cache = new Cache();
    expect(cache.getStore()).toEqual({
      registrations: {},
      reportsPaths: {}
    });
    expect(cache).toHaveProperty('localStorageKey');
  });

  test('it can get cached URL', () => {
    localStorage.setItem('fw_reports_query_cache', JSON.stringify({
      registrations: {
        ['{"to":"2018-12-12","from":"2018-10-12","accounts":"1414,232,3421"}']: 'https://esmiley.dk/registrations'
      },
      projects: {
        ['{"to":"2018-12-12","from":"2018-10-12","account":"1421"}']: 'https://esmiley.dk/projects'
      },
      sales: {
        ['{"to":"2018-12-12","from":"2018-10-12","accounts":"1414,232,3421"}']: 'https://esmiley.dk/sales'
      }
    }));
    const cache = new Cache();

    const registrationsUrl = cache.getCachedUrlByParams('registrations', {
      to: '2018-12-12',
      from: '2018-10-12',
      accounts: '1414,232,3421'
    });
    expect(registrationsUrl).toBe('https://esmiley.dk/registrations');

    const projectsUrl = cache.getCachedUrlByParams('projects', {
      to: '2018-12-12',
      from: '2018-10-12',
      account: '1421'
    });
    expect(projectsUrl).toBe('https://esmiley.dk/projects');

    const salesUrl = cache.getCachedUrlByParams('sales', {
      to: '2018-12-12',
      from: '2018-10-12',
      accounts: '1414,232,3421'
    });
    expect(salesUrl).toBe('https://esmiley.dk/sales');
  });

  test('it can to put a URL', () => {
    const cache = new Cache();
    cache.put('registrations', JSON.stringify({
      to: '2018-12-12',
      from: '2018-10-12',
      account: '14212'
    }), 'https://google.dk');
    const url = cache.getCachedUrlByParams('registrations', { to: '2018-12-12', from: '2018-10-12', account: '14212' });
    expect(url).toBe('https://google.dk');
  });

  test('it can attempt to put a URL where the cache gets exceeded', () => {
    const cache = new Cache({ maxEntries: 2 });
    for (let i = 0; i < 3; i++) {
      cache.put('registrations', JSON.stringify({
        to: '2018-12-12',
        from: '2018-10-12',
        account: i
      }), 'https://google.dk' + i);
    }


    expect(Object.keys(cache.getStore().registrations)).toHaveLength(1);
    expect(cache.getStore().registrations).toHaveProperty('{\"to\":\"2018-12-12\",\"from\":\"2018-10-12\",\"account\":2}');
    expect(cache.getStore().registrations['{\"to\":\"2018-12-12\",\"from\":\"2018-10-12\",\"account\":2}']).toBe('https://google.dk2');
  });
});
