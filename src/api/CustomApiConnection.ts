import {
  IApiConnection,
  SrServiceRequest,
  RequestType,
  Log,
  SrServiceResponse,
} from 'react-strontium';
import { isEmpty, isNull, isUndefined } from 'lodash';
import ApiError from 'react-strontium/dist/api/ApiError';
import ErrorUtil, { IApiError } from '../utilities/ErrorUtil';

interface IWebApiConnectionDefaults {
  contentType: string;
  cached: boolean;
  process: boolean;
  credentials: RequestCredentials;
}

export default class CustomApiConnection implements IApiConnection {
  constructor(
    public resourceBase: string,
    public defaults: IWebApiConnectionDefaults = {
      contentType: 'application/json',
      cached: false,
      process: true,
      credentials: 'same-origin',
    }
  ) {}

  public initialize(cb: (r: boolean) => void, reinit: boolean): void {
    cb(true);
  }

  protected dataPath(): string {
    return this.resourceBase;
  }

  protected getMethod(request: SrServiceRequest): string {
    switch (request.type) {
      case RequestType.Create:
        return 'POST';
      case RequestType.Delete:
        return 'DELETE';
      case RequestType.Update:
        return 'PATCH';
      default:
        return 'GET';
    }
  }

  private handleErrorRetryAttempts = 1;
  sendRequest(request: SrServiceRequest): void {
    var method = this.getMethod(request);
    var contentType = this.getContentType(request);
    let data = request.content;
    const isFormData = data instanceof FormData;

    if (
      data &&
      !isFormData &&
      method !== 'GET' &&
      method !== 'HEAD' &&
      this.getProcessData(request)
    ) {
      data = JSON.stringify(data);
    }

    Log.d(this, 'Preparing HTTP API Message', {
      request: request,
      method: method,
      contentType: contentType,
      data: data,
    });

    // Possible Response Formats
    // Simple Success: Response body is response data as JSON object or array
    // Simple Exception: Response body is error data as string
    // Complex Success: Response body is JSON object with "responseData" and "errors" properties - responseData is populated and errors array is empty
    // Complex Exceptions: Response body is JSON object with "responseData" and "errors" properties - responseData could be null and errors array is populated
    window
      // Fetch Response
      .fetch(
        this.dataPath() + request.action,
        this.fetchInit(method, contentType, data, request)
      )
      // Getting Response Body As Text
      .then(async (resp) => {
        return { response: resp, responseAsText: await resp.text() };
      })
      // Transform the complex or simple response object into 3 pieces: original response, responseData and errors
      .then(({ response, responseAsText }) =>
        this.responseDataAdapter(response, responseAsText)
      )
      // Validate the response
      .then(({ response, responseData, errors }) =>
        this.validateResponse(response, responseData, errors)
      )
      // Handle the response
      .then((responseData) => this.handleResponse(responseData, request))
      .catch((error) => this.handleError(error, request));
  }

  protected fetchInit(
    method: string,
    contentType: string,
    data: string | any,
    request: SrServiceRequest
  ): RequestInit {
    let credentials = this.optionOrDefault<RequestCredentials>(
      'credentials',
      request
    );

    let reqInit: RequestInit = {
      method: method,
      body: data,
      credentials: credentials,
    };

    if (contentType) {
      reqInit.headers = {
        'Content-Type': contentType,
      };
    }

    return reqInit;
  }

  // Possibly temporary adapter to handle API responses where the body of
  // the response is either the data object alone
  // or the data object is nested within a responseData object.
  // The handleResponse currently only handles the data object with no awareness of any error metadata
  // provided by the response
  protected responseDataAdapter(
    response: Response,
    responseAsText: string
  ): { response: Response; responseData: string; errors: Array<IApiError> } {
    if (
      isNull(responseAsText) ||
      isUndefined(responseAsText) ||
      isEmpty(responseAsText)
    ) {
      return { response, responseData: responseAsText, errors: [] };
    }

    try {
      const json = JSON.parse(responseAsText);
      if (json && !isUndefined(json.responseData)) {
        return {
          response,
          responseData: isNull(json.responseData)
            ? null
            : JSON.stringify(json.responseData),
          errors: json.errors,
        };
      }

      return { response, responseData: responseAsText, errors: [] };
    } catch (err) {
      return {
        response,
        responseData: responseAsText,
        errors: ErrorUtil.buildResponseErrors(
          500,
          'responseProcessing',
          err.message
        ),
      };
    }
  }

  protected breakCache(request: SrServiceRequest): boolean {
    return !this.optionOrDefault('cached', request);
  }

  protected getContentType(request: SrServiceRequest): any {
    return this.optionOrDefault('contentType', request);
  }

  protected getProcessData(request: SrServiceRequest): boolean {
    return this.optionOrDefault('process', request) === true;
  }

  protected optionOrDefault<T>(
    key: keyof IWebApiConnectionDefaults,
    request: SrServiceRequest
  ): T {
    if (request.options && Object.keys(request.options).includes(key)) {
      return request.options[key];
    }

    return ((this.defaults || {}) as T)[key];
  }

  protected async validateResponse(
    response: Response,
    responseData: string,
    errors: any
  ) {
    this.validateResponseSession(response);
    this.validateResponseStatusCode(response, responseData);
    this.validateResponseErrors(errors);
    return responseData;
  }

  protected validateResponseSession(response: Response) {
    if (response.redirected && response.url.includes('Account/AccessDenied')) {
      throw new ApiError(
        ErrorUtil.buildResponseErrors(401, 'Unauthorized', 'Access Denied')
      );
    }

    // handle reloading the app if response is a redirect to the login page which is
    // indicative of session expiration
    if (response.redirected && response.url.includes('Account/Login')) {
      window.location.reload();
      // throw an error even though the page is going to reload has a tiny async time gap.
      throw new ApiError(
        ErrorUtil.buildResponseErrors(401, 'Unauthorized', 'Session Expired')
      );
    }
  }

  protected validateResponseStatusCode(
    response: Response,
    responseData: string
  ) {
    if (!response.ok) {
      throw new ApiError(
        ErrorUtil.buildResponseErrors(
          response.status,
          response.statusText,
          this.cleanUpErrorMessage(responseData)
        )
      );
    }
  }

  protected validateResponseErrors(errors) {
    if (!isEmpty(errors)) {
      throw new ApiError(errors);
    }
  }

  protected cleanUpErrorMessage(message: string): string {
    if (isEmpty(message)) {
      return message;
    }

    message = message.startsWith('"')
      ? message.substring(1, message.length - 1)
      : message;
    message = message.endsWith('"')
      ? message.substring(0, message.length - 1)
      : message;
    return message;
  }
  protected handleResponse(responseData: string, req: SrServiceRequest) {
    this.handleErrorRetryAttempts = 1;
    if (this.onResponse) {
      let resp = new SrServiceResponse(req);
      resp.data = responseData;
      resp.good = true;
      this.onResponse(resp);
    } else {
      Log.e(this, 'Response received, but no handler available', {
        request: req,
        data: responseData,
      });
    }
  }

  protected handleError(error: any, req: SrServiceRequest) {
    const MAX_RETRIES = 4;
    if (this.handleErrorRetryAttempts === MAX_RETRIES) {
      this.handleErrorRetryAttempts = 1;
      return;
    }

    this.handleErrorRetryAttempts += 1;
    if (this.onFailedRequest) {
      if (Object.keys(error).includes('response')) {
        this.onFailedRequest(req, error.response);
      } else {
        this.onFailedRequest(req, [JSON.stringify(error)]);
      }
    } else {
      Log.e(this, 'Request failed, but no handler available', {
        request: req,
        error: error,
      });
    }
  }

  connected(): boolean {
    return true;
  }

  onResponse: (resp: SrServiceResponse) => void;
  onFailedRequest: (req: SrServiceRequest, error: any[]) => void;
  onServerMessage: (resp: SrServiceResponse) => void;
}
