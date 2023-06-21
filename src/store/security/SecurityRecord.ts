import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';
import ISecurityError from '../../models/ISecurityError';
import ISecurityViolation from '../../models/ISecurityViolation';

interface ISecurityState {
  showSecurityOverlay?: boolean;
  isSecurityCheckDone?: boolean;
  isSecurityMode?: boolean;
  isSecurityAppOn?: boolean;
  isSecurityAppLoading?: boolean;
  isSecurityAppMonitoring?: boolean;
  securityViolations?: Immutable.List<IImmutableObject<ISecurityViolation>>;
  securityErrors?: Immutable.List<IImmutableObject<ISecurityError>>;
  sessionId?: string;
}

export const initialStore = {
  showSecurityOverlay: false,
  isSecurityCheckDone: false,
  isSecurityMode: false,
  isSecurityAppOn: false,
  isSecurityAppLoading: false,
  isSecurityAppMonitoring: false,
  securityViolations: Immutable.List<IImmutableObject<ISecurityViolation>>(),
  securityErrors: Immutable.List<IImmutableObject<ISecurityError>>(),
  sessionId: null,
};

export default class SecurityRecord extends Immutable.Record(initialStore) {
  constructor(params?: ISecurityState) {
    params ? super(params) : super();
  }

  get<T extends keyof ISecurityState>(value: T): ISecurityState[T] {
    return super.get(value);
  }

  with(values: ISecurityState) {
    return this.merge(values) as this;
  }
}
