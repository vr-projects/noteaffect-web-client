import ISecurityError from './ISecurityError';

interface ISecurityAppError {
  isError: boolean;
  errors?: ISecurityError[];
}

export default ISecurityAppError;
