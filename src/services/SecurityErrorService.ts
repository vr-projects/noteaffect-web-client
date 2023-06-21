import ISecurityError from '../models/ISecurityError';
import ISecurityInternalErrorCodes from '../models/ISecurityError';
import ISecurityAppServerErrorCodes from '../models/ISecurityError';

export default class SecurityError implements ISecurityError {
  public errorCode:
    | ISecurityInternalErrorCodes
    | ISecurityAppServerErrorCodes
    | any;
  public errorDesc: string;

  constructor(
    errorCode: ISecurityInternalErrorCodes | ISecurityAppServerErrorCodes | any,
    errorDesc: string
  ) {
    this.errorCode = errorCode;
    this.errorDesc = errorDesc;
  }
}
