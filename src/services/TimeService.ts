import { IAppService, SrAppMessage, Log } from 'react-strontium';
import IInterval from '../interfaces/IInterval';
import DataRecordingUtil from '../utilities/DataRecordingUtil';
import AppBroadcastEvents from '../broadcastEvents/AppBroadcastEvents';

export default class TimeService implements IAppService {
  private _serverTime: number;
  private _browserTime: number;
  private _inactiveIntervals: IInterval[] = [];
  private _enqueuedInterval: IInterval = null;

  public getDiscrepancy(): number {
    return this._browserTime - this._serverTime;
  }

  public originalServerTime(): number {
    return this._serverTime;
  }

  public originalBrowserTime(): number {
    return this._browserTime;
  }

  public currentServerTime(): number {
    return this.originalServerTime() + this.currentRunTime();
  }

  public currentBrowserTime(): number {
    return new Date().getTime();
  }

  public currentRunTime(): number {
    return this.currentBrowserTime() - this.originalBrowserTime();
  }

  public currentActiveTime(): number {
    return this.currentRunTime() - this.inactiveTime();
  }

  public inactiveTime(): number {
    return this._inactiveIntervals
      .map((i) => i.stop - i.start)
      .reduce((p, c) => p + c, 0);
  }

  public isActive(): boolean {
    return this._enqueuedInterval === null;
  }

  initialize(): void {
    this._browserTime = new Date().getTime();
    this._serverTime = window.appEnvironment.serverTime || this._browserTime;
  }

  handles(): string[] {
    return [AppBroadcastEvents.WindowVisibilityChanged];
  }

  receiveMessage(msg: SrAppMessage) {
    if (msg.action === AppBroadcastEvents.WindowVisibilityChanged) {
      this.onVisibilityChanged(msg.data as boolean);
    }
  }

  private onVisibilityChanged(windowFocused: boolean): void {
    Log.d(this, 'On window focus change', { windowFocused: windowFocused });
    if (windowFocused) {
      const interval = this._enqueuedInterval;
      this._enqueuedInterval = null;
      if (interval != null) {
        interval.stop = this.currentBrowserTime();
        this._inactiveIntervals.push(interval);

        DataRecordingUtil.recordDataItem({
          key: 'Application Backgrounded',
          value1: interval.stop - interval.start,
        });
      }
    } else {
      this._enqueuedInterval = {
        start: this.currentBrowserTime(),
        stop: undefined,
      };
    }
  }
}
