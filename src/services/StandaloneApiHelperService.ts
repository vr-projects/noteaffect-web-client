import {
  SrServiceResponse,
  SrAppMessage,
  IAppService,
  CommonMessages,
  Log,
  ApiHelpers,
} from 'react-strontium';
import StandaloneConnection from '../api/StandaloneConnection';
import RealtimeBroadcastEvents from '../broadcastEvents/RealtimeBroadcastEvents';

export default class StandaloneApiHelperService implements IAppService {
  private _apiDelay: number = 500;
  private _connectedState: boolean = true;
  private _throwApiErrorsOn: { [key: string]: any } = {};
  private _connection: StandaloneConnection;
  private _presentIndex: number = -1;
  private _presenting: boolean = false;
  private _presData: any;
  private _presentingHandle: number;

  constructor(
    apiDelay: number = 500,
    initialConnectedState: boolean,
    ...initialThrowOn: string[]
  ) {
    this._connectedState = initialConnectedState;
    this._throwApiErrorsOn = initialThrowOn || [];
    this._apiDelay = apiDelay;
    (window as any).apiService = this;
  }

  initialize() {}

  handles(): string[] {
    return [
      CommonMessages.RemoteOriginatedMessage,
      CommonMessages.ApiInitialized,
    ];
  }

  async receiveMessage(msg: SrAppMessage) {
    if (msg.action === CommonMessages.RemoteOriginatedMessage) {
      Log.t(this, 'Direct message', msg);
    } else {
      let resp = await ApiHelpers.read('presentation');
      if (resp.good) {
        this._presData = resp.data;
      }
    }
  }

  public setApiDelay(delay: number): void {
    this._apiDelay = delay;
  }

  public apiDelay(): number {
    return this._apiDelay;
  }

  public setConnection(conn: StandaloneConnection) {
    this._connection = conn;
  }

  public sendServerMessage(msg: SrServiceResponse) {
    this._connection.onServerMessage(msg);
  }

  public setConnectionState(connected: boolean): void {
    this._connectedState = connected;
  }

  public connectedState(): boolean {
    return this._connectedState;
  }

  public setThrowApiErrorOn(action: string, error: any): void {
    this._throwApiErrorsOn[action] = error;
  }

  public setPresenting(presenting: boolean) {
    if (this._presenting !== presenting) {
      this._presentIndex = -1;
      window.clearTimeout(this._presentingHandle);
    }
    this._presenting = presenting;

    if (this._presenting) {
      this.presentNextSlide();
    }
  }

  public presentNextSlide() {
    this._presentIndex++;
    if (this._presentIndex >= this._presData.slideData.length) {
      this._presentIndex = 0;
    }
    let resp = new SrServiceResponse();
    resp.action = RealtimeBroadcastEvents.SlidePresented;
    let slideInfo = this._presData.slideData[this._presentIndex];
    resp.data = {
      courseId: this._presData.courseId,
      slideId: slideInfo.id,
      slides: this._presData.slides,
      slideNumber: slideInfo.slide,
      sequence: slideInfo.sequence,
      imageUrl: slideInfo.imageUrl,
    };
    this._connection.onServerMessage(resp);
    this._presentingHandle = window.setTimeout(
      () => this.presentNextSlide(),
      slideInfo.duration * 1000
    );
  }

  public throwApiErrorForAction(
    action: string
  ): { throw: boolean; error: any } {
    let keys = Object.keys(this._throwApiErrorsOn);
    if (keys.indexOf(action) !== -1) {
      return { throw: true, error: this._throwApiErrorsOn[action] };
    } else if (keys.indexOf('*') !== -1) {
      return { throw: true, error: this._throwApiErrorsOn['*'] };
    }
    return { throw: false, error: undefined };
  }

  public removeThrowApiErrorOn(action: string): void {
    let idx = this._throwApiErrorsOn.indexOf(action);
    if (idx !== -1) {
      this._throwApiErrorsOn.splice(idx, 1);
    }
  }
}
