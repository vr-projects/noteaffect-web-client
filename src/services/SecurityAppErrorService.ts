import ISecurityAppError from '../models/ISecurityAppError';
import ISecurityError from '../models/ISecurityError';

export default class SecurityAppError implements ISecurityAppError {
  public isError: boolean;
  public errors: ISecurityError[];

  constructor(isError: boolean, errors: ISecurityError[]) {
    this.isError = isError;
    this.errors = errors;
  }
}
