// todo: replace with fe-core/DataStore
import { CachedFilter } from 'redux/ducks/reports-new/index';

export default class Cache {
  private cachingEnabled = window.hasOwnProperty('localStorage');
  private localStorageKey = 'fw_new_reports_filter_cache';
  private store = {
    reportsPaths: {} as { [userId: string]: CachedFilter }
  };

  constructor(disableCache?: boolean) {
    this.cachingEnabled = !disableCache && this.cachingEnabled;
    if (this.cachingEnabled && window.localStorage.getItem(this.localStorageKey)) {
      try {
        // eslint-disable-next-line
        this.store = Object.assign(
          this.store,
          JSON.parse(window.localStorage.getItem(this.localStorageKey))
        );
      } catch (e) {
        console.error(e);
      }
    }
  }

  public getIsCachingEnabled(): boolean {
    return this.cachingEnabled;
  }

  public persistReportsPath(userId: number, data: CachedFilter): void {
    if (!this.getIsCachingEnabled()) {
      return;
    }

    if (!data) {
      delete this.store.reportsPaths[userId];
    } else {
      this.store.reportsPaths[userId] = data;
    }
    this.persistStore();
  }

  public getReportsPath(userId: number): CachedFilter | null {
    return this.store.reportsPaths.hasOwnProperty(userId) ? this.store.reportsPaths[userId] : null;
  }

  public persistStore() {
    window.localStorage.setItem(this.localStorageKey, JSON.stringify(this.store));
  }
}
