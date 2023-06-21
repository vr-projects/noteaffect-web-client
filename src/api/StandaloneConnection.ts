import {
  IApiConnection,
  SrServiceRequest,
  SrServiceResponse,
} from 'react-strontium';
import StandaloneApiHelperService from '../services/StandaloneApiHelperService';

export default class StandaloneConnection implements IApiConnection {
  constructor(public helperService: StandaloneApiHelperService) {
    if (!helperService) {
      throw new Error('Requires a helper service');
    }

    helperService.setConnection(this);
  }

  initialize(cb: (r: boolean) => void, reinit: boolean): void {
    cb(this.helperService.connectedState());
  }

  sendRequest(request: SrServiceRequest): void {
    window.setTimeout(async (_) => {
      let action = this.helperService.throwApiErrorForAction(request.action);
      if (action.throw) {
        this.onFailedRequest(request, [action.error]);
      } else {
        this.onResponse(await this.validResponse(request));
      }
    }, Math.max(0, this.helperService.apiDelay()));
  }

  private async validResponse(
    req: SrServiceRequest
  ): Promise<SrServiceResponse> {
    let resp = new SrServiceResponse();
    resp.action = req.action;
    resp.good = true;
    resp.requestId = req.requestId;

    switch (req.action) {
      case 'courses':
        resp.data = await this.fetchData('/samples/courses.json');
        break;
      case 'presentation':
        resp.data = await this.fetchData('/samples/sample_1.json');
        break;
    }

    return resp;
  }

  private async fetchData(file: string): Promise<any> {
    let resp = await window.fetch(file, { method: 'GET' });
    return await resp.json();
  }

  connected(): boolean {
    return this.helperService.connectedState();
  }

  onResponse: (resp: SrServiceResponse) => void;
  onFailedRequest: (req: SrServiceRequest, error: any[]) => void;
  onServerMessage: (resp: SrServiceResponse) => void;
}
