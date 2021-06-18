import { initialState } from './reducer';
import * as selectors from './selectors';

describe('[REDUX] reports v2 > selectors', () => {

  test('singleAccountFilterSelector', () => {
    expect(initialState.filter.account).toBe(null);
    let reports = Object.assign({}, initialState, {
      searchCriteria: {
        to: '2018-08-03',
        from: '2018-04-02',
        accounts: [ 232, 25981, 122 ],
        account: 1337
      }
    });

    const filtered = selectors.singleAccountFilterSelector({ reports });
    expect(filtered).toHaveProperty('account');
    expect(filtered.to).toBe('2018-08-03');
    expect(filtered.from).toBe('2018-04-02');
    expect(filtered.account).toBe(1337);
  });

  test('multipleAccountsFilterSelector', () => {
    expect(initialState.filter.accounts).toHaveLength(0);
    let reports = Object.assign({}, initialState, {
      searchCriteria: {
        to: '2018-08-03',
        from: '2018-04-02',
        accounts: [ 232, 25981, 122 ],
        account: 1337
      }
    });

    const filtered = selectors.multipleAccountsFilterSelector(reports.searchCriteria);
    expect(filtered).toHaveProperty('accounts');
    expect(filtered.to).toBe('2018-08-03');
    expect(filtered.from).toBe('2018-04-02');
    expect(filtered.accounts).toEqual('232,25981,122');
  });

  describe('routeParamsSelector', () => {

    test('can make a path', () => {

      const filter = {
        accounts: [ '123', '1555', '3234' ],
        from: '2017-01-01',
        to: '2018-12-10',
        interval: 'weeks',
        id: 151,
        category: ['Fish', 'Vegetables', 'Meat'],
        product: ['African glass catfish', 'Australian prowfish', 'Shark', 'Carrot', 'Cow'],
        area: ['Kitchen', 'Bathroom', 'Dungeon']
      };

      const { path, search } = selectors.routeParamsSelector({ filter: filter, dashboardId: 'foodwaste' });
      expect(path).toBe('01-01-2017/10-12-2018/123&1555&3234/weeks');
      expect(search).toBe('?categories=Fish|Vegetables|Meat&areas=Kitchen|Bathroom|Dungeon&products=African glass catfish|Australian prowfish|Shark|Carrot|Cow');
    });

    test('can make a path with no items or project ids or intervals or accounts', () => {

      const filter = {
        accounts: [],
        from: '2017-01-01',
        to: '2018-12-10'
      };

      const { path, search } = selectors.routeParamsSelector({ filter: filter, dashboardId: 'foodwaste' });
      expect(path).toBe('01-01-2017/10-12-2018/current/custom');
      expect(search).toBe('');
    });

    test('can make a path with no project id', () => {

      const filter = {
        accounts: [ '123', '1555', '3234' ],
        from: '2019-01-01',
        to: '2018-12-10',
        interval: 'weeks',
        category: ['Fish', 'Vegetables', 'Meat'],
        product: ['African glass catfish', 'Australian prowfish', 'Shark', 'Carrot', 'Cow'],
        area: ['Kitchen', 'Bathroom', 'Dungeon']
      };

      const { path, search } = selectors.routeParamsSelector({ filter: filter, dashboardId: 'foodwaste' });
      expect(path).toBe('01-01-2019/01-01-2019/123&1555&3234/weeks');
      expect(search).toBe('?categories=Fish|Vegetables|Meat&areas=Kitchen|Bathroom|Dungeon&products=African glass catfish|Australian prowfish|Shark|Carrot|Cow');
    });

    test('can make a path with no items or project ids or intervals', () => {

      const filter = {
        accounts: [ '123', '1555', '3234' ],
        from: '2018-12-10',
        to: '2018-12-10'
      };

      const { path, search } = selectors.routeParamsSelector({ filter: filter, dashboardId: 'foodwaste' });
      expect(path).toBe('10-12-2018/10-12-2018/123&1555&3234/custom');
      expect(search).toBe('');
    });

    test('can make a path with no categories', () => {

      const filter = {
        accounts: [ '123', '1555', '3234' ],
        from: '2018-01-01',
        to: '2018-12-10',
        interval: 'weeks',
        id: 151,
        product: ['African glass catfish', 'Australian prowfish', 'Shark', 'Carrot', 'Cow'],
        area: ['Kitchen', 'Bathroom', 'Dungeon']
      };

      const { path, search } = selectors.routeParamsSelector({ filter: filter, dashboardId: 'foodwaste' });
      expect(path).toBe('01-01-2018/10-12-2018/123&1555&3234/weeks');
      expect(search).toBe('?areas=Kitchen|Bathroom|Dungeon&products=African glass catfish|Australian prowfish|Shark|Carrot|Cow');
    });

    test('can make a path with no areas', () => {

      const filter = {
        accounts: [ '123', '1555', '3234' ],
        from: '2019-01-01',
        to: '2018-12-10',
        interval: 'weeks',
        id: 151,
        category: ['Fish', 'Vegetables', 'Meat'],
        product: ['African glass catfish', 'Australian prowfish', 'Shark', 'Carrot', 'Cow'],
      };

      const { path, search } = selectors.routeParamsSelector({ filter: filter, dashboardId: 'foodwaste' });
      expect(path).toBe('01-01-2019/01-01-2019/123&1555&3234/weeks');
      expect(search).toBe('?categories=Fish|Vegetables|Meat&products=African glass catfish|Australian prowfish|Shark|Carrot|Cow');
    });

    test('can make a path with no products', () => {

      const filter = {
        accounts: [ '123', '1555', '3234' ],
        from: '2019-01-01',
        to: '2018-12-10',
        interval: 'weeks',
        id: 151,
        category: ['Fish', 'Vegetables', 'Meat'],
        area: ['Kitchen', 'Bathroom', 'Dungeon']
      };

      const { path, search } = selectors.routeParamsSelector({ filter: filter, dashboardId: 'foodwaste' });
      expect(path).toBe('01-01-2019/01-01-2019/123&1555&3234/weeks');
      expect(search).toBe('?categories=Fish|Vegetables|Meat&areas=Kitchen|Bathroom|Dungeon');
    });

    test('can make a path without item filters', () => {

      const filter = {
        accounts: [ '123', '1555', '3234' ],
        from: '2019-01-01',
        to: '2018-12-10',
        interval: 'weeks',
        id: 151
      };

      const { path, search } = selectors.routeParamsSelector({ filter: filter, dashboardId: 'foodwaste' });
      expect(path).toBe('01-01-2019/01-01-2019/123&1555&3234/weeks');
      expect(search).toBe('');
    });

    test('can make a path with empty item filters', () => {

      const filter = {
        accounts: [ '123', '1555', '3234' ],
        from: '2011-01-01',
        to: '2018-12-10',
        interval: 'weeks',
        category: [],
        area: [],
        product: []
      };

      const { path, search } = selectors.routeParamsSelector({ filter: filter, dashboardId: 'foodwaste' });
      expect(path).toBe('01-01-2011/10-12-2018/123&1555&3234/weeks');
      expect(search).toBe('');
    });
  });
});
