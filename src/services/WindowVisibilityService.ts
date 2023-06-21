import { IAppService, SrAppMessage, runtime, Log } from 'react-strontium';
import AppBroadcastEvents from '../broadcastEvents/AppBroadcastEvents';

export default class WindowVisibilityService implements IAppService {
  private _windowFocused: boolean = null;

  initialize(): void {
    document.addEventListener('visibilitychange', () =>
      this.onVisibilityChanged()
    );
    window.onblur = () => this.onVisibilityChanged(false);
    window.onfocus = () => this.onVisibilityChanged(true);
    this.onVisibilityChanged();
  }

  handles(): string[] {
    return [];
  }

  receiveMessage(msg: SrAppMessage) {}

  private onVisibilityChanged(windowFocused: boolean = null): void {
    Log.d(this, 'Window visibility changed', {
      visibilityState: document.visibilityState,
      windowFocused: windowFocused,
    });
    if (this.windowCurrentlyFocused(windowFocused)) {
      this._windowFocused = true;
      runtime.messaging.broadcast(
        AppBroadcastEvents.WindowVisibilityChanged,
        true,
        true
      );
    } else if (this.windowNotCurrentlyFocused(windowFocused)) {
      this._windowFocused = false;
      runtime.messaging.broadcast(
        AppBroadcastEvents.WindowVisibilityChanged,
        true,
        false
      );
    }
  }

  private windowCurrentlyFocused(windowFocused: boolean = null): boolean {
    return (
      (this._windowFocused == null || this._windowFocused === false) &&
      ((document.visibilityState === 'visible' && windowFocused == null) ||
        windowFocused === true)
    );
  }

  private windowNotCurrentlyFocused(windowFocused: boolean = null): boolean {
    return (
      (this._windowFocused == null || this._windowFocused === true) &&
      (document.visibilityState === 'hidden' || windowFocused === false)
    );
  }
}
