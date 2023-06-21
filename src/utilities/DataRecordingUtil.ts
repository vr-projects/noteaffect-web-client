import IDataItem from '../data_storage/IDataItem';
import { runtime } from 'react-strontium';
import AppBroadcastEvents from '../broadcastEvents/AppBroadcastEvents';

export default class DataRecordingUtil {
  public static recordAction(action: string): void {
    const item: IDataItem = { key: action };
    this.recordDataItem(item);
  }

  public static recordDataItem(item: IDataItem): void {
    runtime.messaging.broadcast(AppBroadcastEvents.RecordDataItem, true, item);
  }
}
