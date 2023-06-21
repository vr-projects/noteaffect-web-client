import * as React from 'react';
import { runtime, SrUiComponent, Popover } from 'react-strontium';
import { FaCog } from 'react-icons/fa';
import StandaloneApiHelperService from '../../services/StandaloneApiHelperService';

interface IStandaloneApiHelperComponentProps {}

interface IStandaloneApiHelperComponentState {
  apiDelay: number;
  presenting: boolean;
  connected: boolean;
}

export default class StandaloneApiHelperComponent extends SrUiComponent<
  IStandaloneApiHelperComponentProps,
  IStandaloneApiHelperComponentState
> {
  private _service: StandaloneApiHelperService;

  initialState() {
    this._service = runtime.services.get<StandaloneApiHelperService>(
      'apiService'
    );
    return {
      apiDelay: this._service.apiDelay(),
      presenting: false,
      connected: this._service.connectedState(),
    };
  }

  performRender() {
    let content = (
      <div className="standalone-tools">
        <p>API Delay (ms)</p>
        <input
          type="number"
          value={this.state.apiDelay}
          onChange={(e) => {
            let delay = parseInt(e.target.value);
            if (isNaN(delay)) {
              delay = 0;
            }
            this.setPartial({ apiDelay: delay });
            this._service.setApiDelay(delay);
          }}
        />
        <hr />
        <p>API Connected</p>
        <input
          type="checkbox"
          checked={this.state.connected}
          onChange={(e) => {
            let connected = e.target.checked;
            this.setPartial({ connected: connected });
            this._service.setConnectionState(connected);
          }}
        />
        <hr />
        <p>Presenting Slides</p>
        <input
          type="checkbox"
          checked={this.state.presenting}
          onChange={(e) => {
            let presenting = e.target.checked;
            this.setPartial({ presenting: presenting });
            this._service.setPresenting(presenting);
          }}
        />
      </div>
    );
    return (
      <Popover
        id={'standalone-helper'}
        content={content}
        placement="top"
        title="Standalone API Tools"
      >
        <div className="standalone-helper-popover">
          <FaCog />
        </div>
      </Popover>
    );
  }
}
