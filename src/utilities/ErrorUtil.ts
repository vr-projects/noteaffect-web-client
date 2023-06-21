import isEmpty from 'lodash/isEmpty';

export interface IApiError {
  httpStatusCode: number;
  errorType: string;
  message: string;
}

enum ALERT_STYLE_TYPE {
  SUCCESS = 'success',
  DANGER = 'danger',
  WARNING = 'warning',
}
class ApiError extends Error {
  constructor(error: any) {
    super(!isEmpty(error) ? error[0].message : 'An error has occurred');

    if (!isEmpty(error)) {
      this.errors = error.map((a) => {
        return {
          httpStatusCode: a.httpStatusCode,
          errorType: a.type,
          message: a.message,
        };
      });
    }
  }

  private errors: IApiError[];

  public getErrors = () => this.errors;

  public getErrorMessage = () => {
    return this.getErrors()
      .map((a) => a.message)
      .join(', ');
  };

  public getAlertStyleType = (showWarningAsSuccess: boolean) =>
    showWarningAsSuccess && this.getErrors()[0].errorType === 'WarningException'
      ? ALERT_STYLE_TYPE.SUCCESS
      : this.getErrors()[0].errorType === 'WarningException'
      ? ALERT_STYLE_TYPE.WARNING
      : ALERT_STYLE_TYPE.DANGER;
}

export default class ErrorUtil {
  static buildResponseErrors(code: number, type: string, message: string): any {
    return [
      {
        httpStatusCode: code,
        errorType: type,
        message: message,
      },
    ];
  }

  static getError(errors: any): ApiError {
    return new ApiError(errors);
  }

  static getErrorMessage(errors: any): string {
    return ErrorUtil.getError(errors)
      .getErrors()
      .map((a) => a.message)
      .join();
  }

  static throwErrorMessage(errors: any) {
    throw new Error(errors.map((a) => a.message).join(', '));
  }

  static handleAPIErrors(resp, customErrorMessage = '') {
    if (!isEmpty(resp.errors)) {
      this.throwErrorMessage(resp.errors);
    } else if (!resp.good) {
      throw new Error(customErrorMessage);
    }
  }
}
