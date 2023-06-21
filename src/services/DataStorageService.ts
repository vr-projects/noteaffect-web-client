import { IAppService, SrAppMessage, ApiHelpers, Log } from 'react-strontium';
import AppBroadcastEvents from '../broadcastEvents/AppBroadcastEvents';
import * as SecurityActions from '../store/security/SecurityActions';
import IDataItem from '../data_storage/IDataItem';
import DataStorage from '../data_storage/DataStorage';
import Dispatcher from '../utilities/Dispatcher';

export default class DataStorageService implements IAppService {
  private _readyToSend: boolean = true;
  private _enabled: boolean = true;
  private _dataStorage: DataStorage;
  private _sending: boolean = false;
  private _sendHandle: number = null;

  initialize(): void {
    this._dataStorage = new DataStorage();
  }

  handles(): string[] {
    return [
      AppBroadcastEvents.RecordDataItem,
      AppBroadcastEvents.NoteAffectAppReady,
    ];
  }

  receiveMessage(msg: SrAppMessage): void {
    if (msg.action === AppBroadcastEvents.RecordDataItem) {
      this.recordDataItem(msg.data as IDataItem);
    } else if (msg.action === AppBroadcastEvents.NoteAffectAppReady) {
      // set sessionId to the store
      Dispatcher.dispatch(SecurityActions.setSessionId(this.getSessionId()));

      this.recordDataItem({ key: 'Application launched' });
      this._sendHandle = window.setInterval(() => this.sendData(), 5000);
    }
  }

  public getSessionId() {
    return this._dataStorage.getSessionId();
  }

  public start(): void {
    this._enabled = true;
  }

  public stop(): void {
    this._enabled = false;
  }

  private recordDataItem(item: IDataItem) {
    Log.d(this, 'Recording data item', item);
    this._dataStorage.addItem(item);
  }

  private async sendData() {
    if (!this._readyToSend || !this._enabled || this._sending) {
      Log.d(this, 'Unable to send', {
        ready: this._readyToSend,
        enabled: this._enabled,
        sending: this._sending,
      });
      return;
    }

    Log.d(this, 'Preparing to send data');

    this._sending = true;
    try {
      let items = this._dataStorage.getUnsentItems(5);
      while (items.length > 0) {
        Log.d(this, 'Successfully sent data', items);
        if (!this.sendItems(items)) {
          break;
        }
        items = this._dataStorage.getUnsentItems(5);
      }
    } catch (exc) {
      Log.e(this, 'Error trying to send data', exc);
    }

    this._sending = false;
  }

  private async sendItems(items: IDataItem[]) {
    const resp = await ApiHelpers.create('data', items);
    if (!resp.good) {
      this._dataStorage.addFailedItems(items);
      return false;
    }
    return true;
  }
}
