import IDataItem from './IDataItem';
import uuid from 'uuid';
import { runtime } from 'react-strontium';
import ServiceReduxConnectionServices from '../services/ServiceReduxConnectionServices';
import TimeService from '../services/TimeService';

export default class DataStorage {
  private _inMemoryQueue: IDataItem[] = [];
  private _inMemorySent: string[] = [];
  private _sessionId: string;

  constructor() {
    this._sessionId = uuid.v4();
  }

  public getSessionId() {
    return this._sessionId;
  }

  public dequeueItems(items: number): IDataItem[] {
    return [];
  }

  public addItem(item: IDataItem) {
    if (!item || item.localId) {
      return;
    }

    this.patchDataItem(item);
    this._inMemoryQueue.push(item);
  }

  public addFailedItems(items: IDataItem[]) {
    items.forEach((item) => {
      if (
        !item ||
        !item.localId ||
        this._inMemorySent.indexOf(item.localId) === -1
      ) {
        return;
      }

      this._inMemoryQueue.push(item);
    });
  }

  public getUnsentItems(itemCount: number) {
    itemCount = Math.min(5, Math.max(1, itemCount));
    const items = this._inMemoryQueue.splice(0, itemCount);
    items.forEach((i) => this._inMemorySent.push(i.localId));
    return items;
  }

  private patchDataItem(item: IDataItem) {
    const timeService = runtime.services.get<TimeService>('timeService');
    item.localId = uuid.v4();
    item.localTime = timeService.currentBrowserTime();
    item.serverTime = timeService.currentServerTime();
    item.runtime = timeService.currentRunTime();
    item.activeTime = timeService.currentActiveTime();
    item.sessionId = this._sessionId;
    item.active = timeService.isActive();
    let svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    let userInfo = svc.getUserInformation();
    item.userId = userInfo.get('id');
  }
}
