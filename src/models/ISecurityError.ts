import SecurityInternalErrorCodes from '../enums/SecurityInternalErrorCodes';
import SecurityAppServerErrorCodes from '../enums/SecurityAppServerErrorCodes';

interface ISecurityError {
  errorCode: SecurityInternalErrorCodes | SecurityAppServerErrorCodes;
  errorDesc: string;
}

export default ISecurityError;
