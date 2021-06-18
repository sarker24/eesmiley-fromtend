/**
 * Cache helper functions for the Reports (v2)
 */

export type CacheOptions = {
  disableCache?: boolean;
  maxEntries?: number;
};

export default class Cache {

  readonly maxEntries: number;
  private cachingEnabled = window.hasOwnProperty('localStorage');
  private localStorageKey = 'fw_reports_query_cache';
  private store = {
    reportsPaths: {},
    registrations: {}
  };

  constructor(options: CacheOptions = {}) {
    const { disableCache = false, maxEntries = 50 } = options;
    this.cachingEnabled = (!disableCache && this.cachingEnabled);
    this.maxEntries = maxEntries;
    if (this.cachingEnabled && window.localStorage.getItem(this.localStorageKey)) {
      try {
        this.store = Object.assign(this.store, JSON.parse(window.localStorage.getItem(this.localStorageKey)));
      } catch (e) {
      }
    }
  }

  /**
   * Get store
   * @returns {{}}
   */
  public getStore() {
    return this.store;
  }

  /**
   * Get if caching is enabled
   * @returns {boolean}
   */
  public getIsCachingEnabled() {
    return this.cachingEnabled;
  }

  public persistReportsPath(userId, url) {
    if (!this.getIsCachingEnabled()) {
      return;
    }

    if (url == null) {
      delete this.store.reportsPaths[userId];
    } else {
      this.store.reportsPaths[userId] = url;
    }
    this.persistStore();
  }

  public getReportsPath(userId) {
    return this.store.reportsPaths.hasOwnProperty(userId) ? this.store.reportsPaths[userId] : null;
  }

  /**
   *
   * @param group
   * @param params
   * @returns {any}
   */
  public getCachedUrlByParams(group: string, params: {}) {

    if (!this.store.hasOwnProperty(group)) {
      return null;
    }

    const paramsJsonString = JSON.stringify(params);
    if (this.store[group].hasOwnProperty(paramsJsonString)) {
      return this.store[group][paramsJsonString];
    }

    return null;
  }

  public persistStore() {
    window.localStorage.setItem(this.localStorageKey, JSON.stringify(this.store));
  }

  /**
   * Put a value into the cache
   * @param group
   * @param key
   * @param value
   */
  public put(group: string, key: string, value: any) {
    this.store[group] = Object.assign({}, this.store[group], { [key]: value });
    if (this.cachingEnabled) {

      // If the number of strings exceeds max entries, reset the cache.
      if (Object.keys(this.store[group]).length > this.maxEntries) {
        this.store[group] = { [key]: value };
      }

      this.persistStore();
    }
  }
}
